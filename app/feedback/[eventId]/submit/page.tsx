'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Star, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)}>
            <Star className={cn('h-6 w-6 transition-colors', s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FeedbackSubmitPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    overallRating: 0,
    organizationRating: 0,
    hospitalityRating: 0,
    contentRating: 0,
    suggestions: '',
    testimonial: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.overallRating) return toast.error('Please provide an overall rating')
    setLoading(true)
    try {
      await addDoc(collection(db, 'events', eventId, 'feedback'), {
        submittedBy: form.name || null,
        overallRating: form.overallRating,
        organizationRating: form.organizationRating || null,
        hospitalityRating: form.hospitalityRating || null,
        contentRating: form.contentRating || null,
        suggestions: form.suggestions || null,
        testimonial: form.testimonial || null,
        approved: false,
        submittedAt: serverTimestamp(),
        eventId,
      })
      setSubmitted(true)
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
          <p className="text-gray-600 mt-2">Your feedback has been submitted successfully. We appreciate you taking the time to share your thoughts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
          <p className="text-gray-600 mt-1">Help us improve by sharing your experience</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label>Your Name (optional)</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Anonymous" />
              </div>

              <StarRating value={form.overallRating} onChange={(v) => setForm({ ...form, overallRating: v })} label="Overall Rating *" />

              <div className="grid grid-cols-3 gap-4">
                <StarRating value={form.organizationRating} onChange={(v) => setForm({ ...form, organizationRating: v })} label="Organization" />
                <StarRating value={form.hospitalityRating} onChange={(v) => setForm({ ...form, hospitalityRating: v })} label="Hospitality" />
                <StarRating value={form.contentRating} onChange={(v) => setForm({ ...form, contentRating: v })} label="Content" />
              </div>

              <div className="space-y-1.5">
                <Label>Suggestions for Improvement</Label>
                <Textarea rows={3} value={form.suggestions} onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                  placeholder="What could we do better?" />
              </div>

              <div className="space-y-1.5">
                <Label>Testimonial (may be published)</Label>
                <Textarea rows={3} value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  placeholder="Share your experience in your own words..." />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !form.overallRating}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
