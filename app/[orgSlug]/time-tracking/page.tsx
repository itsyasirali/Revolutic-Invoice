import TimeEntryList from "@/components/TimeTracking/TimeEntryList";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Time Tracking", "Track billable and non-billable time against customers and projects, and invoice it.");


const TimeTrackingPage = () => <TimeEntryList />;

export default TimeTrackingPage;
