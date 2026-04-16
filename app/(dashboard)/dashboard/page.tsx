import { redirect } from 'next/navigation'

// /dashboard with no eventId has nothing to show — send the user to the
// events list so they can pick an event and open its dashboard.
export default function DashboardIndexPage() {
  redirect('/events')
}
