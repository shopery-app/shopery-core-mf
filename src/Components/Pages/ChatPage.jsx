import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "../Advisory/Chat";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";


export default function ChatPage() {
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
  axios
    .get(`${apiURL}/merchant/shops/dashboard`)
    .then(res => setShop(res.data.data))
    .catch(err => {
      console.error("DASHBOARD ERROR:", err);
      setShop(null);
    })
}, []);

  if (!shop) return null;

    if (shop.subscriptionTier !== "PREMIUM") {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-yellow-300 bg-yellow-50 p-8 text-center shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Premium Feature 🔒
            </h2>
            <p className="text-gray-600 mb-6">
            AI Assistant is available only for Premium merchants.
            </p>
            <button
            onClick={() => navigate("/merchant/upgrade")}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700"
            >
            Upgrade to Premium
            </button>
        </div>
        </div>
    );
    }


   return <Chat />;
}
