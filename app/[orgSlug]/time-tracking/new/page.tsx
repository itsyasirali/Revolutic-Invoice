import TimeEntryForm from "@/components/TimeTracking/TimeEntryForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Log Time", "Log time for a customer or project, with a start and end time or a running timer.");


const NewTimeEntryPage = () => <TimeEntryForm />;

export default NewTimeEntryPage;
