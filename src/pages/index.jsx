import Layout from "./Layout.jsx";

import Home from "./Home";

import Learning from "./Learning";

import TopicDetail from "./TopicDetail";

import Training from "./Training";

import Leaderboard from "./Leaderboard";

import Profile from "./Profile";

import TrainingHub from "./TrainingHub";

import TrainingHistory from "./TrainingHistory";

import Membership from "./Membership";

import LingdouHistory from "./LingdouHistory";

import PointsShop from "./PointsShop";

import MyOrders from "./MyOrders";

import TrainingGoals from "./TrainingGoals";

import PointsHistory from "./PointsHistory";

import ExchangeHistory from "./ExchangeHistory";

import Settings from "./Settings";

import LearningPath from "./LearningPath";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Learning: Learning,
    
    TopicDetail: TopicDetail,
    
    Training: Training,
    
    Leaderboard: Leaderboard,
    
    Profile: Profile,
    
    TrainingHub: TrainingHub,
    
    TrainingHistory: TrainingHistory,
    
    Membership: Membership,
    
    LingdouHistory: LingdouHistory,
    
    PointsShop: PointsShop,
    
    MyOrders: MyOrders,
    
    TrainingGoals: TrainingGoals,
    
    PointsHistory: PointsHistory,
    
    ExchangeHistory: ExchangeHistory,
    
    Settings: Settings,
    
    LearningPath: LearningPath,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Learning" element={<Learning />} />
                
                <Route path="/TopicDetail" element={<TopicDetail />} />
                
                <Route path="/Training" element={<Training />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/TrainingHub" element={<TrainingHub />} />
                
                <Route path="/TrainingHistory" element={<TrainingHistory />} />
                
                <Route path="/Membership" element={<Membership />} />
                
                <Route path="/LingdouHistory" element={<LingdouHistory />} />
                
                <Route path="/PointsShop" element={<PointsShop />} />
                
                <Route path="/MyOrders" element={<MyOrders />} />
                
                <Route path="/TrainingGoals" element={<TrainingGoals />} />
                
                <Route path="/PointsHistory" element={<PointsHistory />} />
                
                <Route path="/ExchangeHistory" element={<ExchangeHistory />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/LearningPath" element={<LearningPath />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}