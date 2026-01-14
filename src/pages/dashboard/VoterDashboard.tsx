import { useEffect, useState } from 'react'
import { PageWrapper } from '../../components/PageWrapper'
import { AnimatedContainer } from '../../components/AnimatedContainer'
import { motion } from 'framer-motion'
import { User as UserIcon, Calendar, Shield, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
    id: string
    name: string
    email: string
    role: string
    status: string
    aadhaar: string
}

interface Election {
    id: string
    title: string
    date: string
    status: string
    description: string
}

export default function VoterDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [elections, setElections] = useState<Election[]>([])
    
    useEffect(() => {
        // Fetch User Data
        const userId = localStorage.getItem('userId')
        if (!userId) {
            navigate('/login')
            return
        }
        
        // Simulating fetch or real fetch if endpoint is ready
        // For now, using mock or the endpoint if running
        fetch(`http://localhost:5001/api/users/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user)
                }
            })
            .catch(err => console.error(err))

        // Fetch Elections
        fetch('http://localhost:5001/api/elections')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setElections(data.elections)
                }
            })
            .catch(err => console.error(err))
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('isAuthenticated')
        navigate('/login')
    }

    return (
        <PageWrapper>
            <div className="dashboard-container p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Voter Dashboard</h1>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <AnimatedContainer delay={0.1} className="col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <UserIcon className="w-12 h-12 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{user?.name || 'Loading...'}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                                
                                <div className="mt-6 w-full space-y-3">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Voter ID</span>
                                        <span className="font-semibold">{user?.id}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600">Status</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            {user?.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedContainer>

                    {/* Upcoming Elections */}
                    <AnimatedContainer delay={0.2} className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            Upcoming Elections
                        </h2>
                        
                        <div className="space-y-4">
                            {elections.length > 0 ? (
                                elections.map((election, index) => (
                                    <motion.div 
                                        key={election.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                                                <p className="text-gray-600 mt-1">{election.description}</p>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {election.date}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium uppercase">
                                                        {election.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md transform hover:scale-105">
                                                Participate
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-gray-500">Loading elections...</p>
                            )}
                        </div>
                    </AnimatedContainer>
                </div>
            </div>
        </PageWrapper>
    )
}
