import React from "react";
import Image from "next/image";
import type { ArticleProps } from "@/types/resource";

const Article = ({ item }: ArticleProps) => {
  return (
    <article className="w-full">
      <div
        className="
          text-lg text-slate-700 leading-relaxed font-medium space-y-6
          [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-12 [&>h2]:mb-6
          [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-10 [&>h3]:mb-4
          [&>p]:mb-6
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
          [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>blockquote]:my-8
        "
        dangerouslySetInnerHTML={{ __html: item.content || "" }}
      />

      {/* Author Bio Box at the bottom (if author exists) */}
      {item.authorName && item.authorAvatar && (
        <div className="mt-16 pt-8 ">
          <div className=" p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md">
              <Image
                src={item.authorAvatar}
                alt={item.authorName}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                {item.authorName}
              </h4>
              <p className="text-slate-600 font-medium">
                Content Marketing Manager at Sellora. Passionate about
                conversational commerce, customer experience, and helping
                businesses scale their communication efficiently.
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default Article;
