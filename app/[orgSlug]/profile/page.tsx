import Profile from "@/components/profile/Profile";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Profile", "Manage your personal details, avatar and password.");


const ProfilePage = () => <Profile />;

export default ProfilePage;
