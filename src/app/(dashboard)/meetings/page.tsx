import { createServerSupabase } from '@/lib/supabase/server'

export default async function MeetingsPage() {
  const supabase = await createServerSupabase()

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false })

  if (error) {
    return <p className="text-sm text-red-500">Failed to load meetings.</p>
  }

  const upcoming = meetings?.filter(
    (m) => new Date(m.meeting_date) >= new Date()
  )
  const past = meetings?.filter(
    (m) => new Date(m.meeting_date) < new Date()
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Meetings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming?.length ?? 0} upcoming
          </p>
        </div>
      </div>

      {/* Upcoming meetings */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Upcoming</h2>
        <div className="space-y-3">
          {upcoming && upcoming.length > 0 ? (
            upcoming.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(meeting.meeting_date).toLocaleDateString(
                        'en-KE',
                        {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                      {meeting.meeting_time && ' · ' + meeting.meeting_time}
                    </p>
                    {meeting.venue && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {meeting.venue}
                      </p>
                    )}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    Upcoming
                  </span>
                </div>

                {meeting.agenda && meeting.agenda.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Agenda</p>
                    <ul className="space-y-1">
                      {meeting.agenda.map((item: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-gray-700"
                        >
                          <div className="w-1 h-1 rounded-full bg-green-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
              No upcoming meetings scheduled.
            </div>
          )}
        </div>
      </div>

      {/* Past meetings */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">Past meetings</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Venue
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Attendance
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Minutes
                </th>
              </tr>
            </thead>
            <tbody>
              {past && past.length > 0 ? (
                past.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(meeting.meeting_date).toLocaleDateString(
                        'en-KE',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {meeting.venue ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {meeting.attendance ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          meeting.minutes_recorded
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {meeting.minutes_recorded ? 'Recorded' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No past meetings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}