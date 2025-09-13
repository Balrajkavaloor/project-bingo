import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Trophy, 
  Gamepad2, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  BarChart3,
  Play
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
    
    // Listen for real-time game completion updates
    if (socket) {
      socket.on('gameCompleted', (data) => {
        console.log('Profile: Game completed, updating stats:', data);
        // Refresh stats when game completes
        fetchUserStats();
      });
    }

    // Listen for window events from SocketContext
    const handleGameCompleted = (event) => {
      console.log('Profile: Window game completed event:', event.detail);
      // Refresh stats when game completes
      fetchUserStats();
    };

    window.addEventListener('gameCompleted', handleGameCompleted);
    
    return () => {
      if (socket) {
        socket.off('gameCompleted');
      }
      window.removeEventListener('gameCompleted', handleGameCompleted);
    };
  }, [socket]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUserStats = async () => {
    try {
      console.log('Profile: Fetching user stats...');
      const token = localStorage.getItem('accessToken');
      console.log('Profile: Token exists:', !!token);
      
      // Fetch real user stats from backend API (same as Dashboard)
      const response = await axios.get('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile: Backend response:', response.data);
      
      if (response.data) {
        const backendStats = response.data;
        
        // Use backend stats if available
        const realStats = {
          gamesPlayed: backendStats.gamesPlayed || 0,
          gamesWon: backendStats.gamesWon || 0,
          gamesLost: backendStats.gamesLost || 0,
          gamesDrawn: backendStats.gamesDrawn || 0,
          totalLinesCompleted: backendStats.totalLinesCompleted || 0,
          averageLinesPerGame: backendStats.averageLinesPerGame || 0,
          winRate: backendStats.winRate || 0,
          achievementLevel: backendStats.achievementLevel || 'Bingo Rookie'
        };
        
        console.log('Profile: Setting backend stats:', realStats);
        setStats(realStats);
      } else {
        // Fallback to localStorage if backend fails
        const savedStats = localStorage.getItem(`bingoStats_${user._id}`);
        let userStats = {
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          gamesDrawn: 0,
          totalLinesCompleted: 0,
          averageLinesPerGame: 0
        };
        
        if (savedStats) {
          userStats = JSON.parse(savedStats);
        }

        const winRate = userStats.gamesPlayed > 0 
          ? ((userStats.gamesWon / userStats.gamesPlayed) * 100).toFixed(1) 
          : '0.0';

        const realStats = {
          gamesPlayed: userStats.gamesPlayed,
          gamesWon: userStats.gamesWon,
          gamesLost: userStats.gamesLost,
          gamesDrawn: userStats.gamesDrawn || 0,
          totalLinesCompleted: userStats.totalLinesCompleted,
          averageLinesPerGame: userStats.averageLinesPerGame,
          winRate: winRate,
          achievementLevel: 'Bingo Rookie'
        };
        
        setStats(realStats);
      }
    } catch (error) {
      console.error('Profile: Error fetching user stats:', error);
      console.error('Profile: Error response:', error.response?.data);
      
      // Fallback to localStorage if API fails
      const savedStats = localStorage.getItem(`bingoStats_${user._id}`);
      let userStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
        totalLinesCompleted: 0,
        averageLinesPerGame: 0
      };
      
      if (savedStats) {
        userStats = JSON.parse(savedStats);
      }

      const winRate = userStats.gamesPlayed > 0 
        ? ((userStats.gamesWon / userStats.gamesPlayed) * 100).toFixed(1) 
        : '0.0';

      const realStats = {
        gamesPlayed: userStats.gamesPlayed,
        gamesWon: userStats.gamesWon,
        gamesLost: userStats.gamesLost,
        gamesDrawn: userStats.gamesDrawn || 0,
        totalLinesCompleted: userStats.totalLinesCompleted,
        averageLinesPerGame: userStats.averageLinesPerGame,
        winRate: winRate,
        achievementLevel: 'Bingo Rookie'
      };
      
      setStats(realStats);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementLevel = () => {
    if (stats?.gamesWon >= 100) return { level: 'Bingo Master', color: 'text-purple-600', icon: '👑' };
    if (stats?.gamesWon >= 50) return { level: 'Bingo Expert', color: 'text-blue-600', icon: '🏆' };
    if (stats?.gamesWon >= 25) return { level: 'Bingo Pro', color: 'text-green-600', icon: '🥇' };
    if (stats?.gamesWon >= 10) return { level: 'Bingo Player', color: 'text-yellow-600', icon: '🥈' };
    return { level: 'Bingo Rookie', color: 'text-gray-600', icon: '🥉' };
  };

  const achievement = getAchievementLevel();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - Responsive */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Your Profile
        </h1>
        <p className="text-gray-200 text-base md:text-lg mb-6">
          Track your progress and achievements
        </p>
        
        {/* Username and Details Display - Mobile Responsive */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 inline-block max-w-full mx-4">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl md:text-3xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                {user.username}
              </h2>
              <p className="text-gray-200 text-sm md:text-base mb-3">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xl md:text-2xl">{achievement.icon}</span>
                <span className={`font-medium text-white bg-black/20 px-3 py-1 rounded-full text-sm md:text-base`}>
                  {achievement.level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="profile-stat-card group">
          <div className="stat-card-inner">
            <div className="stat-card-front">
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Trophy className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats?.gamesWon || 0}</h3>
                <p className="text-gray-600 text-xs md:text-sm">Games Won</p>
              </div>
            </div>
           
          </div>
        </div>
        
        <div className="profile-stat-card group">
          <div className="stat-card-inner">
            <div className="stat-card-front">
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Gamepad2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats?.gamesPlayed || 0}</h3>
                <p className="text-gray-600 text-xs md:text-sm">Games Played</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-stat-card group">
          <div className="stat-card-inner">
            <div className="stat-card-front">
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Target className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats?.winRate || 0}%</h3>
                <p className="text-gray-600 text-xs md:text-sm">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-stat-card group">
          <div className="stat-card-inner">
            <div className="stat-card-front">
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats?.totalLinesCompleted || 0}</h3>
                <p className="text-gray-600 text-xs md:text-sm">Lines Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Essentials Only: Small summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="card">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Overview</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">{stats?.gamesPlayed || 0}</div>
              <div className="text-sm font-medium text-gray-700">Games</div>
                </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats?.gamesWon || 0}</div>
              <div className="text-sm font-medium text-gray-700">Wins</div>
                  </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats?.gamesLost || 0}</div>
              <div className="text-sm font-medium text-gray-700">Losses</div>
                  </div>
                </div>
              </div>
        <div className="card">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Performance</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Win Rate</div>
              <div className="text-xl font-bold text-indigo-600">{stats?.winRate || 0}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Avg Lines/Game</div>
              <div className="text-xl font-bold text-purple-600">{stats?.averageLinesPerGame || 0}</div>
                  </div>
                </div>
              </div>
        <div className="card">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Member</h3>
          <div className="text-sm font-medium text-gray-700">
            Since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

    

      {/* Minimal recent activity */}
      <div className="card">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Recent Activity</h3>
        <div className="text-sm text-gray-700">Last played: 2 hours ago</div>
      </div>

      {/* Member Since - Compact */}
      
    </div>
  );
};

export default Profile;
