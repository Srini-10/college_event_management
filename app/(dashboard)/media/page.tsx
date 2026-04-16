'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { MediaFile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { toast } from 'sonner'
import { Image, Upload, Trash2, Folder, Loader2, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Progress } from '@/components/ui/progress'

export default function MediaPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const { user } = useAuthStore()
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filterAlbum, setFilterAlbum] = useState('all')
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null)
  const [newAlbumName, setNewAlbumName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const ALBUMS = ['Day 1', 'Day 2', 'Inauguration', 'Cultural Night', 'Group Photo', 'Awards', 'Registration', 'Other']

  useEffect(() => {
    if (!eventId) return
    let isMounted = true
    getDocs(query(collection(db, 'events', eventId, 'media'), orderBy('uploadedAt', 'desc')))
      .then((snap) => {
        if (isMounted) {
          setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaFile)))
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [eventId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length || !eventId || !user) return

    const album = newAlbumName || filterAlbum !== 'all' ? filterAlbum : 'Other'
    setUploading(true)

    for (const file of selectedFiles) {
      const storageRef = ref(storage, `events/${eventId}/media/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document'
            const docRef = await addDoc(collection(db, 'events', eventId, 'media'), {
              album, fileName: file.name, fileUrl: url, fileType,
              size: file.size, uploadedBy: user.uid,
              uploadedAt: serverTimestamp(), eventId,
            })
            setFiles((prev) => [{
              id: docRef.id, album, fileName: file.name, fileUrl: url,
              fileType: fileType as 'image' | 'video' | 'document', size: file.size, uploadedBy: user.uid,
              uploadedAt: Timestamp.now(), eventId,
            }, ...prev])
            resolve()
          }
        )
      })
    }
    setUploading(false)
    setUploadProgress(0)
    toast.success(`${selectedFiles.length} file(s) uploaded`)
    e.target.value = ''
  }

  const albums = [...new Set(files.map((f) => f.album))]
  const filtered = filterAlbum === 'all' ? files : files.filter((f) => f.album === filterAlbum)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Media & Documents</h2>
          <p className="text-sm text-gray-500 mt-0.5">{files.length} files across {albums.length} albums</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterAlbum} onValueChange={setFilterAlbum}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Albums</SelectItem>
              {albums.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {uploading && <Progress value={uploadProgress} className="h-1.5" />}

      {!eventId ? (
        <EmptyState icon={Image} title="No event selected" />
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Image} title="No media files" description="Upload photos, videos, and documents"
          actionLabel="Upload Files" onAction={() => fileRef.current?.click()} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <div key={file.id} className="group relative rounded-lg overflow-hidden aspect-square bg-gray-100 cursor-pointer"
              onClick={() => setLightboxFile(file)}>
              {file.fileType === 'image' ? (
                <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <Folder className="h-8 w-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 text-center line-clamp-2">{file.fileName}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(file) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                <p className="text-white text-xs truncate">{file.album}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxFile} onOpenChange={() => setLightboxFile(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setLightboxFile(null)}>
              <X className="h-4 w-4" />
            </Button>
            {lightboxFile?.fileType === 'image' ? (
              <img src={lightboxFile?.fileUrl} alt={lightboxFile?.fileName} className="w-full max-h-[80vh] object-contain" />
            ) : (
              <div className="p-8 text-center">
                <Folder className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <p className="font-medium">{lightboxFile?.fileName}</p>
                <a href={lightboxFile?.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline mt-2 block">
                  Open File
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>Delete &quot;{deleteTarget?.fileName}&quot;? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await deleteDoc(doc(db, 'events', eventId, 'media', deleteTarget!.id))
              setFiles((prev) => prev.filter((f) => f.id !== deleteTarget!.id))
              setDeleteTarget(null)
              toast.success('Deleted')
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
