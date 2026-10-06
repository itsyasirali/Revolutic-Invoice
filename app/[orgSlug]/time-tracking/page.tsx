import { redirect } from "next/navigation";

// Time is tracked inside each project now; the standalone list is gone.
const TimeTrackingPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  const { orgSlug } = await params;
  redirect(`/${orgSlug}/projects`);
};

export default TimeTrackingPage;
