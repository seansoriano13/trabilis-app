export const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return 'bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'departed':
            return 'bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'arrived':
            return 'bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-md text-xs font-medium'
        case 'estimated':
            return 'bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-md text-xs font-medium'
        default:
            return 'bg-gray-200 text-gray-600 px-3 py-1 rounded-md text-xs font-medium'
    }
}
