export type Notification = {
    id: string
    title: string
    message: string
    seen: boolean
    created_at: string
    user_id: string
    type?: string
    body: string
    metadata?: Record<string, any>
}
