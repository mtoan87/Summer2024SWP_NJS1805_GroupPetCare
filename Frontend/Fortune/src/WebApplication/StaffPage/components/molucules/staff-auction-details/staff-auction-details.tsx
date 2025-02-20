import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../../../config/axios';
import './staff-auction-details.scss'
import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';

function StaffAuctionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [auction, setAuction] = useState(null);
    const [jewelryDetails, setJewelryDetails] = useState(null);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [isAuctionOpen, setIsAuctionOpen] = useState(false);
    const [isAuctionEnded, setIsAuctionEnded] = useState(false);

    const storedUser = sessionStorage.getItem("loginedUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const accountId = user ? user.accountId : null;

    // Fetch auction details
    const fetchAuctionDetails = useCallback(async () => {
        try {
            const response = await api.get(`api/Auctions/GetById/${id}`);
            const auctionData = response.data;
            console.log('Auction Details:', auctionData);
            setAuction(auctionData);

            const jewelryDetails = await fetchJewelryDetails(auctionData);
            console.log('Jewelry Details:', jewelryDetails);
            setJewelryDetails(jewelryDetails);

            // Check if auction is open for joining
            const currentTime = new Date();
            const auctionStartTime = new Date(auctionData.starttime);
            const auctionEndTime = new Date(auctionData.endtime);
            setIsAuctionOpen(currentTime >= auctionStartTime && currentTime <= auctionEndTime);
            setIsAuctionEnded(currentTime > auctionEndTime);
        } catch (err) {
            console.error('Error fetching auction details:', err);
        }
    }, [id]);

    const fetchAttendeeCount = useCallback(async () => {
        try {
            const response = await api.get(`api/Auctions/${id}/account-count`);
            console.log('Attendee Count:', response.data);
            setAttendeeCount(response.data.accountCount);
        } catch (err) {
            console.error('Error fetching attendee count:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchAuctionDetails();
        fetchAttendeeCount();
    }, [fetchAuctionDetails, fetchAttendeeCount]);

    // Display success message if any
    useEffect(() => {
        if (location.state && location.state.message) {
            message.success(location.state.message);
        }
    }, [location.state]);

    // Fetch bid by auction ID
    useEffect(() => {
        if (auction && auction.auctionId) {
            const fetchBidByAuction = async () => {
                try {
                    const bidResponse = await api.get(`api/Bid/GetBidByAuctionId/${auction.auctionId}`);
                    console.log('Bid Response:', bidResponse.data);
                    const bidValues = bidResponse.data.$values;
                    if (bidValues && bidValues.length > 0) {
                        const bidId = bidValues[0].bidId;
                        console.log('Bid ID:', bidId);
                    } else {
                        console.log('No bid data found');
                    }
                } catch (error) {
                    console.error('Error fetching bid by auction:', error);
                }
            };

            fetchBidByAuction();
        }
    }, [auction]);

    // Handle join auction
    const handleJoinAuction = async () => {
        if (!isAuctionOpen) {
            message.error('Auction has not started yet. You cannot join.');
            return;
        }
        navigate(`/mybidding/${id}`);
    };

    if (!auction || !jewelryDetails) {
        return <div>Loading...</div>;
    }

    const purity = {
        'PureSilver925': '92.5%',
        'PureSilver999': '99.9%',
        'PureSilver900': '90.0%',
        'PureSilver958': '95.8%'
    };

    const goldAge = {
        Gold24: '24K',
        Gold22: '22K',
        Gold20: '20K',
        Gold18: '18K',
        Gold14: '14K'
    };

    return (
        <div className="auctions-details">
            <h1>Auction Details</h1>
            <div className="auction-details-content">
                <div className="jewelry-details">
                    {jewelryDetails.map((jewelry, index) => (
                        <div key={index}>
                            <img
                                className='item-img'
                                src={`https://localhost:44361/${jewelry.jewelryImg}`}
                                alt={jewelry.name}
                            />
                            <p><strong>Name:</strong> {jewelry.name}</p>
                            <p><strong>Materials:</strong> {jewelry.materials}</p>
                            <p><strong>Description:</strong> {jewelry.description}</p>
                            <p><strong>Price:</strong> ${jewelry.price}</p>
                            <p><strong>Weight:</strong> {jewelry.weight}</p>
                            {jewelry.materials.toLowerCase().includes('gold') && (
                                <p><strong>Gold Age:</strong> {goldAge[jewelry.goldAge]}</p>
                            )}
                            {jewelry.materials.toLowerCase().includes('silver') && (
                                <p><strong>Purity:</strong> {purity[jewelry.purity]}</p>
                            )}
                            {jewelry.materials.toLowerCase().includes('golddiamond') && (
                                <>
                                <p><strong>Gold Age:</strong> {goldAge[jewelry.goldAge]}</p>
                                <p><strong>Clarity:</strong> {jewelry.clarity}</p>
                                <p><strong>Carat:</strong> {jewelry.carat}</p>
                                </>
                            )}
                        </div>
                    ))}

                    <p><strong>Date:</strong> {new Date(auction.starttime).toLocaleDateString()}</p>
                    <p><strong>Start Time:</strong> {new Date(auction.starttime).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>End Time:</strong> {new Date(auction.endtime).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Number of Attendees:</strong> {attendeeCount}</p>
                    <button className="staff-join-auction-button" onClick={handleJoinAuction} disabled={!isAuctionOpen || isAuctionEnded}>
                        {isAuctionEnded ? 'Auction Ended' : (isAuctionOpen ? 'Join Auction' : 'Auction Not Open')}
                    </button>
                </div>
            </div>
        </div>
    );
}

async function fetchJewelryDetails(item) {
    try {
        let jewelryDetails = [];

        const promises = [];

        if (item.jewelryGoldId) {
            const goldPromise = api.get(`/api/JewelryGold/GetById/${item.jewelryGoldId}`);
            promises.push(goldPromise);
        }

        if (item.jewelrySilverId) {
            const silverPromise = api.get(`/api/JewelrySilver/GetById/${item.jewelrySilverId}`);
            promises.push(silverPromise);
        }

        if (item.jewelryGolddiaId) {
            const golddiaPromise = api.get(`/api/JewelryGoldDia/GetById/${item.jewelryGolddiaId}`);
            promises.push(golddiaPromise);
        }

        const responses = await Promise.all(promises);

        responses.forEach(response => {
            jewelryDetails.push(response.data);
        });

        return jewelryDetails;
    } catch (err) {
        console.error('Error fetching jewelry details:', err);
        return [];
    }
}


export default StaffAuctionDetails