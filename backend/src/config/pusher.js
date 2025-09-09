import Pusher from 'pusher'

// Use real Pusher in production, mock in development
const isProduction = process.env.NODE_ENV === 'production'

export const pusher = isProduction ? new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true
}) : {
    trigger: async (channel, event, data) => {
        console.log(`🔔 [LOCAL] Notification: ${channel}/${event}`, data)
        console.log('📱 This would show as a notification in the admin panel')
        return Promise.resolve() // Make it async like the real Pusher
    }
}
