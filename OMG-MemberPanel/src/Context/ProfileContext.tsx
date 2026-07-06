import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { decryptData } from "../utils/helper/Crypto";

import { rawApi } from "../utils/ApiHelper"; // ← see export note below

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
export interface ProfileData {
  FirstName: string;
  LastName: string;
  FullName: string;
  Username: string;
  EmailId: string;
  ContactNo: string;
  DOB: string | null;
  CountryName: string;
  ClientLogo: string;
  AvatarUrl: string;
  MemberSince: string;
  LastLogin: string;
  MemberStatus: string;
}

/* ─────────────────────────────────────────
   DEFAULTS
───────────────────────────────────────── */
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  profileLoading: false,
  avatarUrl: DEFAULT_AVATAR,
  refreshProfile: async () => {},
  setAvatarUrl: () => {},
});

/* ─────────────────────────────────────────
   PROVIDER
───────────────────────────────────────── */
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  const getClientId = (): string => {
    const encrypted = localStorage.getItem("clientId");

    if (!encrypted) return ""; // ✅ prevent crash

    try {
      return decryptData(encrypted) ?? "";
    } catch (err) {
      console.error("Decrypt failed:", err);
      return "";
    }
  };

  /* ──────────────────────────────────────
     Uses rawApi (axios instance) directly.
     No React hooks. Safe outside <Router>.
  ────────────────────────────────────── */
  const refreshProfile = useCallback(async () => {
    const clientId = getClientId();
    if (!clientId) return;

    try {
      setProfileLoading(true);

      const payload = {
        procName: "MemberProfile",
        Para: JSON.stringify({ ClientId: clientId, ActionMode: "GetProfile" }),
      };

      const response = await rawApi.post(
        `${import.meta.env.VITE_EXEC_PROC}/executeprocedure`,
        payload,
      );

      /* ApiHelper returns response.data from the interceptor */
      const raw = response.data;
      const data = Array.isArray(raw)
        ? raw[0]
        : (raw?.data?.[0] ?? raw?.data ?? {});

      const builtAvatarUrl = data?.ClientLogo
        ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}ClientImages/${data.ClientLogo}`
        : DEFAULT_AVATAR;

      const built: ProfileData = {
        FirstName: data?.FirstName ?? "",
        LastName: data?.LastName ?? "",
        FullName:
          [data?.FirstName, data?.LastName].filter(Boolean).join(" ") || "User",
        Username: data?.Username ?? "—",
        EmailId: data?.EmailId ?? "—",
        ContactNo: data?.ContactNo ?? "—",
        DOB: data?.DOB ?? null,
        CountryName: data?.CountryName ?? "",
        ClientLogo: data?.ClientLogo ?? "",
        AvatarUrl: builtAvatarUrl,
        MemberSince: data?.MemberSince ?? "—",
        LastLogin: data?.LastLogin
          ? new Date(data.LastLogin).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "—",
        MemberStatus: data?.MemberStatus ?? "—",
      };

      setProfile(built);
      setAvatarUrl(builtAvatarUrl);
    } catch (err) {
      console.error("ProfileContext: fetch failed", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = getClientId();
    if (id) {
      refreshProfile();
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileLoading,
        avatarUrl,
        refreshProfile,
        setAvatarUrl,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

/* ─────────────────────────────────────────
   HOOK
───────────────────────────────────────── */
export const useProfile = () => useContext(ProfileContext);
