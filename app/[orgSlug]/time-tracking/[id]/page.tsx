import TimeEntrySplitView from "@/components/TimeTracking/TimeEntrySplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Time Entry Details", "Time entry overview with duration, rate, amount, project and activity.");


const DetailsPage = () => <TimeEntrySplitView />;

export default DetailsPage;
