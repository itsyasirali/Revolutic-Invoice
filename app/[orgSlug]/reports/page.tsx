import ReportsView from "@/components/reports/ReportsView";
import { getReportsData, parseReportRange, REPORT_RANGES } from "@/lib/services/reportsService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Reports", "Business reports for sales, receivables, expenses and time.");

const ReportsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) => {
  const [{ range }, user] = await Promise.all([searchParams, getServerSessionUser()]);
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const data = await getReportsData(orgId, parseReportRange(range));

  return <ReportsView data={data} ranges={REPORT_RANGES} />;
};

export default ReportsPage;
