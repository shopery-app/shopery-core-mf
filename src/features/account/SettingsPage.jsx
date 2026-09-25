import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AccountLayout from "../../components/layout/AccountLayout";
import Tabs from "../../components/ui/Tabs";
import { LockIcon, TicketIcon } from "../../components/ui/icons";
import SecuritySection from "./SecuritySection";
import SupportSection from "./SupportSection";

const TABS = [
  { value: "security", label: "Security", icon: LockIcon },
  { value: "support", label: "Support", icon: TicketIcon },
];

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get("tab") === "support" ? "support" : "security";
  const [tab, setTab] = useState(initial);

  return (
    <AccountLayout title="Settings" description="Manage security and get help from our team.">
      <Tabs items={TABS} value={tab} onChange={setTab} className="mb-6" />
      {tab === "security" ? <SecuritySection /> : <SupportSection />}
    </AccountLayout>
  );
};

export default SettingsPage;
