import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import AccountLayout from "../../components/layout/AccountLayout";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { PageSpinner } from "../../components/ui/Feedback";
import { EditIcon, UploadIcon, TrashIcon, MapPinIcon, StoreIcon, DashboardIcon, ClockIcon } from "../../components/ui/icons";
import useProfile from "../../hooks/useProfile";
import EditProfileModal from "./EditProfileModal";
import CreateShopModal from "../merchant/CreateShopModal";
import { uploadProfilePhoto, deleteProfilePhoto } from "../../store/slices/authSlice";
import * as addressesApi from "../../api/addresses";
import { formatDate } from "../../utils/format";

const ProfileOverviewPage = () => {
  const { profile, loading, shopStatus, refetch } = useProfile();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [creatingShop, setCreatingShop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);

  useEffect(() => {
    addressesApi
      .getMyAddresses()
      .then((list) => setDefaultAddress((list || []).find((a) => a.isDefault) || null))
      .catch(() => {});
  }, []);

  if (loading && !profile) {
    return (
      <AccountLayout>
        <PageSpinner />
      </AccountLayout>
    );
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await dispatch(uploadProfilePhoto(file));
    setUploading(false);
    e.target.value = "";
  };

  return (
    <AccountLayout title="Account" description="Manage your personal information and shop.">
      {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} />}
      {creatingShop && (
        <CreateShopModal
          onClose={() => setCreatingShop(false)}
          onSuccess={() => {
            setCreatingShop(false);
            refetch();
          }}
        />
      )}

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={profile?.profilePhoto} name={`${profile?.firstName} ${profile?.lastName}`} size="lg" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-ink-secondary hover:bg-surface-sunken"
                  title="Upload photo"
                >
                  <UploadIcon size={11} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-[13px] text-ink-muted">{profile?.email}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">Member since {formatDate(profile?.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {profile?.profilePhoto && (
                <Button size="sm" variant="ghost" loading={uploading} onClick={() => dispatch(deleteProfilePhoto())}>
                  <TrashIcon size={13} /> Remove photo
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <EditIcon size={13} /> Edit profile
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Phone</p>
              <p className="mt-1 text-[13.5px] text-ink">{profile?.phone || "Not set"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Date of birth</p>
              <p className="mt-1 text-[13.5px] text-ink">{profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not set"}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                <MapPinIcon size={15} /> Default address
              </h3>
              <Link to="/profile/addresses" className="text-[12px] font-medium text-ink-secondary hover:text-ink">
                Manage
              </Link>
            </div>
            {defaultAddress ? (
              <p className="text-[13px] leading-relaxed text-ink-secondary">
                {defaultAddress.addressLine1}
                {defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ""}
                <br />
                {defaultAddress.city}, {defaultAddress.country} {defaultAddress.postalCode}
              </p>
            ) : (
              <p className="text-[13px] text-ink-muted">No default address set.</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              <StoreIcon size={15} /> Your shop
            </h3>
            {shopStatus === "ACTIVE" && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-ink">{profile?.shop?.shopName}</p>
                  <Badge tone="success" className="mt-1">
                    Active
                  </Badge>
                </div>
                <Link to="/shop/dashboard">
                  <Button size="sm" variant="outline">
                    <DashboardIcon size={13} /> Dashboard
                  </Button>
                </Link>
              </div>
            )}
            {shopStatus === "PENDING" && (
              <div className="flex items-center gap-2 text-[13px] text-warning">
                <ClockIcon size={15} /> Your request is under review.
              </div>
            )}
            {(shopStatus === "NONE" || shopStatus === "CLOSED") && (
              <div>
                <p className="mb-3 text-[13px] text-ink-muted">You don&apos;t have a shop yet.</p>
                <Button size="sm" onClick={() => setCreatingShop(true)}>
                  <StoreIcon size={13} /> Start selling
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
};

export default ProfileOverviewPage;
