import React, { useState } from 'react';
import { HandCoins,Video,UserRoundPlus,Eye,BellRing } from 'lucide-react'
import { toast } from 'react-hot-toast';
// Type definitions
interface User {
    id: number;
    fullName: string;
    username: string;
    profileImage: string;
    subscribers?: string;
}

interface Follower extends User {
    isFollowing: boolean;
    subscribers: string;
}

interface Following extends User {
    subscribers: string;
}

interface Subscriber extends User {
    subscribedTime: string;
}

type ActiveTab = 'followers' | 'following' | 'subscribers';

// Mock data
const mockFollowers: Follower[] = [
    { id: 1, fullName: "Sarah Miller", username: "@sarahm", isFollowing: false, profileImage: "👩‍💼", subscribers: "45.2K" },
    { id: 2, fullName: "Mike Chen", username: "@mikechen", isFollowing: true, profileImage: "👨‍💻", subscribers: "45.2K" },
    { id: 3, fullName: "Emma Davis", username: "@emmad", isFollowing: false, profileImage: "👩‍🎨", subscribers: "23.4K" },
    { id: 4, fullName: "James Wilson", username: "@jameswilson", isFollowing: true, profileImage: "👨‍🏫", subscribers: "2.1M" }
];

const mockFollowing: Following[] = [
    { id: 1, fullName: "Tech Guru", username: "@techguru", profileImage: "💻", subscribers: "2.1M subscribers" },
    { id: 2, fullName: "Travel Vlogger", username: "@travelvlog", profileImage: "✈️", subscribers: "890K subscribers" },
    { id: 3, fullName: "Cooking Master", username: "@cookingmaster", profileImage: "👨‍🍳", subscribers: "1.5M subscribers" },
    { id: 4, fullName: "Fitness Coach", username: "@fitnesscoach", profileImage: "💪", subscribers: "750K subscribers" }
];

const mockSubscribers: Subscriber[] = [
    { id: 1, fullName: "Lisa Anderson", username: "@lisa_a", profileImage: "👩‍🔬", subscribedTime: "2 days ago" },
    { id: 2, fullName: "David Kim", username: "@davidkim", profileImage: "👨‍🎓", subscribedTime: "1 week ago" },
    { id: 3, fullName: "Rachel Green", username: "@rachelg", profileImage: "👩‍💼", subscribedTime: "3 days ago" },
    { id: 4, fullName: "Alex Turner", username: "@alext", profileImage: "👨‍🎤", subscribedTime: "5 hours ago" }
];

// Tab configuration
const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'followers', label: 'Followers' },
    { id: 'following', label: 'Following' },
    { id: 'subscribers', label: 'Subscribers' }
];

const SocialStatsComponent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('followers');
    const [followers, setFollowers] = useState<Follower[]>(mockFollowers);
    const [following, setFollowing] = useState<Following[]>(mockFollowing);
    const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
    const [totoalviews, settotalviews] = useState<string>("12.5k")
    const [totoalvideos, settotalvideos] = useState<string>("108")
    const [revenue, setrevenue] = useState<string>("58")



    const handleFollow = (id: number): void => {
        setFollowers(prev =>
            prev.map(follower =>
                follower.id === id
                    ? { ...follower, isFollowing: !follower.isFollowing }
                    : follower
            )
        );
    };

    // Render Followers Section
    const renderFollowers = (): React.ReactElement => (
        <div className="space-y-4">
            <div className="flex items-center px-10 pb-2 border-b theme-border justify-between">
                <h2 className="theme-text-primary text-2xl font-bold">Followers</h2>
                <span className="theme-text-muted  px-3 py-1 rounded-full text-sm">
                    {followers.length} total
                </span>
            </div>

            {followers.map((follower) => (
                <div
                    key={follower.id}
                    className="bg-transparent p-4  transition-all duration-300"
                >
                    <div className="flex items-center justify-between pl-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden  flex items-center justify-center text-xl">
                                <img src="https://placehold.co/150x150" alt="" />
                            </div>
                            <div>
                                <h3 className="theme-text-primary font-semibold">{follower.fullName}</h3>
                                <p className="theme-text-muted text-sm">{follower.username}</p>
                                <p className="theme-text-secondary text-xs mt-1">{follower.subscribers} followers</p>
                            </div>
                        </div>
                        <div className='flex gap-3 items-center justify-center pr-10'>

                        <button
                            onClick={() => handleFollow(follower.id)}
                            className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${follower.isFollowing
                                ? 'theme-border border-2 theme-text-primary theme-hover-effect'
                                : 'active-theme-button text-white '
                            }`}
                            >
                            {follower.isFollowing ? 'Followed' : 'Follow Back'}
                        </button>
                        <button
                            onClick={() => toast.info("view page is pending")}
                            className={`px-6 py-2 rounded-xl border theme-hover-effect theme-border font-medium transition-all duration-300`}
                            >
                            view
                        </button>
                            </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Render Following Section
    const renderFollowing = (): React.ReactElement => (
        <div className="space-y-4">
           <div className="flex items-center px-10 pb-2 border-b theme-border justify-between">
                <h2 className="theme-text-primary text-2xl font-bold">Following</h2>
                <span className="theme-text-muted  px-3 py-1 rounded-full text-sm">
                    {following.length} total
                </span>
            </div>

            {following.map((user) => (
                <div
                    key={user.id}
                    className="bg-transparent p-4  transition-all duration-300"
                >
                 <div className="flex items-center justify-between pl-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xl ">
                                <img className='object-cover w-full h-full rounded-full'  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387" alt=""/>
                            </div>
                            <div>
                                <h3 className="theme-text-primary font-semibold">{user.fullName}</h3>
                                <p className="theme-text-muted text-sm">{user.username}</p>
                                <p className="theme-text-secondary text-xs mt-1">{user.subscribers}</p>
                            </div>
                        </div>
                        <button
                            onClick={()=>toast.info("pending unfollow api")}
                            className="px-6 py-2 theme-border border-2 rounded-xl theme-text-primary font-medium hover:theme-bg-secondary transition-all duration-300"
                        >
                            Unfollow
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    // Render Subscribers Section
    const renderSubscribers = (): React.ReactElement => (
        <div className="space-y-4">

             <div className="flex items-center px-10 pb-2 border-b theme-border justify-between">
                <h2 className="theme-text-primary text-2xl font-bold">Recent Subscribers</h2>
                <span className="theme-text-muted  px-3 py-1 rounded-full text-sm">
                    {subscribers.length} total
                </span>
            </div>

            {subscribers.map((subscriber) => (
                <div
                    key={subscriber.id}
                    className="bg-transparent p-4  transition-all duration-300"
                >
                    <div className="flex items-center justify-between pl-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden  flex items-center justify-center text-xl">
                                <img src="https://placehold.co/150x150" alt="" />
                            </div>
                            <div>
                                <h3 className="theme-text-primary font-semibold">{subscriber.fullName}</h3>
                                <p className="theme-text-muted text-sm">{subscriber.username}</p>
                                <p className="theme-text-secondary text-xs mt-1">Subscribed {subscriber.subscribedTime}</p>
                            </div>
                        </div>
                        <span
                            className="p-3 theme-text-primary hover:theme-bg-secondary transition-all duration-300"
                            aria-label="Notification settings"
                        >
                            <BellRing strokeWidth={2} className='text-emerald-300'/>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );


    return (
        <div className=" min-h-screen  animate-fadeIn ">
            <div className="w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="theme-text-primary text-3xl font-bold mb-2">Social Connections</h1>
                    <p className="theme-text-muted">Manage your followers, following and subscribers</p>
                </div>

                <section className='py-2 flex w-full items-center justify-center h-fit gap-3'>
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 theme-bg-card p-1 rounded-2xl border theme-border  w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 text-xs rounded-xl py-2 px-2 font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? 'active-theme-button text-white'
                                        : 'theme-text-primary hover:theme-bg-secondary'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>{tab.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="w-fit grid grid-cols-4 gap-2 p-1  w-full">
                        <div className="theme-border border rounded-xl flex items-center justify-around px-2 py-2">
                            <div className='flex flex-col justify-center items-start gap-1'>
                                <div className="theme-text-muted text-xs">Total Views</div>
                                <div className="text-md font-bold theme-text-primary">{totoalviews}</div>
                            </div>
                            <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                                <Eye size={30} strokeWidth={1} className='text-sky-400'/>
                            </div>
                        </div>

                        <div className="theme-border border rounded-xl flex items-center justify-around px-2 py-2">
                            <div className='flex flex-col justify-center items-start gap-1'>
                                <div className="theme-text-muted text-xs">Subscribers</div>
                                <div className="text-md font-bold theme-text-primary">{subscribers.length}</div>
                            </div>
                            <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                                <UserRoundPlus size={30} strokeWidth={1} className='text-violet-400'/>
                            </div>
                        </div>

                        <div className="theme-border border rounded-xl flex items-center justify-around px-2 py-2">
                            <div className='flex flex-col justify-center items-start gap-1'>
                                <div className="theme-text-muted text-xs">Videos</div>
                                <div className="text-md font-bold theme-text-primary">{totoalvideos}</div>
                            </div>
                            <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                                <Video size={30} strokeWidth={1} className='text-rose-400'/>
                            </div>
                        </div>

                        <div className="theme-border border rounded-xl flex items-center justify-around px-2 py-2">
                            <div className='flex flex-col justify-center items-start gap-1'>
                                <div className="theme-text-muted text-xs">Revenue</div>
                                <div className="text-md font-bold theme-text-primary"><span>$ </span>{revenue}</div>
                            </div>
                            <div className='w-8 h-8 rounded-full flex items-center justify-center'>
                                <HandCoins size={30} strokeWidth={1} className='text-green-400'/>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Content Section */}
                <div className="rounded-xl py-10 theme-shadow theme-border border">
                    {activeTab === 'followers' && renderFollowers()}
                    {activeTab === 'following' && renderFollowing()}
                    {activeTab === 'subscribers' && renderSubscribers()}
                </div>
            </div>
        </div>
    );
};

export default SocialStatsComponent;