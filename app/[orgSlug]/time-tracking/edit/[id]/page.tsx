import TimeEntryForm from "@/components/TimeTracking/TimeEntryForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Time Entry", "Update this time entry's date, times, project and billing details.");


const EditTimeEntryPage = () => <TimeEntryForm />;

export default EditTimeEntryPage;
