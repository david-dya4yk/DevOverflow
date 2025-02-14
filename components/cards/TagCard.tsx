import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import ROUTES from "@/constants/routes";
import { getDeviconClassName } from "@/lib/utils";
import Image from "next/image";

interface Props {
  _id: string;
  name: string;
  question?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
}

const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
};

const TagCard = ({
  _id,
  name,
  question,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDeviconClassName(name);

  const content = (
    <>
      <Badge className="subtle-medium background-light800_dark300 text-dark500_light700 rounded-md border-none px-4 py-2 uppercase flex flex-row">
        <div className="flex-center space-x-2 ">
          <i className={`${iconClass} text-sm`}></i>
          <p className="">{name}</p>
        </div>
        {remove && (
          <Image
            src="./icons/close.svg"
            width={12}
            height={12}
            alt="close"
            className="cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>
      {showCount && (
        <p className="small-medium text-dark500_light700">{question}</p>
      )}
    </>
  );

  if (compact) {
    return isButton ? (
      <button onClick={handleClick} className="flex justify-between gap-2">
        {content}
      </button>
    ) : (
      <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
        {content}
      </Link>
    );
  }
};

export default TagCard;
