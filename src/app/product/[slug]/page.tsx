import { redirect } from 'next/navigation'

interface Props { params: { slug: string } }

export default function ProductRedirect({ params }: Props) {
  redirect(`/fragrance/${params.slug}`)
}
