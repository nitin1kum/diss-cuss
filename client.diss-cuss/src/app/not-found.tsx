import DefaultLink from "@/components/global/default-link";
import UpdateLoader from "@/components/global/update-loader";

export default function NotFound() {
  return (
    <div className="h-full bg-bg text-text flex flex-col items-center justify-center px-6 text-center">
      <UpdateLoader/>
      <div className="relative flex items-center  justify-center">
        <h1 className="inset-0 text-[150px] font-bold mb-4 text-sky-400/30">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <p className="text-2xl font-bold text-text mb-2">Page not found</p>
          <DefaultLink href="/" className="text-link underline hover:opacity-80">
            Go back home
          </DefaultLink>
        </div>
      </div>
    </div>
  );
}
