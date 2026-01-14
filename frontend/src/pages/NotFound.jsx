import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className='grid min-h-screen place-content-center bg-white px-4'>
            <div className='text-center'>
                {/* Large 404 Background Text */}
                <h1 className='text-9xl font-black text-gray-200'>404</h1>

                {/* Main Heading */}
                <p className='text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
                    Bleh! Not Found
                </p>

                {/* Subtitle */}
                <p className='mt-4 text-gray-500'>
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Button */}
                <Link
                    to='/'
                    className='mt-6 inline-block rounded bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring'
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    )
}
