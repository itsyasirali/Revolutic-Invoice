// Shown instantly while the dashboard's data is being computed on the server, so the
// sidebar/header and this skeleton appear right away instead of a blank wait.
const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
);

const DashboardLoading = () => (
  <div className="w-full px-2 sm:px-4 md:px-6 space-y-6 pb-12">
    <div className="space-y-2">
      <Block className="h-8 w-72" />
      <Block className="h-4 w-56" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Block key={i} className="h-36" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Block className="h-80 lg:col-span-2" />
      <Block className="h-80" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Block className="h-72 lg:col-span-2" />
      <Block className="h-72" />
    </div>
  </div>
);

export default DashboardLoading;
