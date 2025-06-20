import Link from 'next/link'
 
export default function NotFound() {
  return (
    <>
    <html>
      <body>
      <p>The Above Url Cannot Found</p>
      <Link href="/dashboard?tab=overview" className='btn btn-primary'>Return Home</Link>
      </body>
    </html>
    </>
  )
}