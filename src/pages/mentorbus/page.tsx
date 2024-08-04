import { useState, useEffect } from "react";
import { SearchBox } from "@/components/ui/searchbox";
import BottomNav from "@/containers/navbar";
import { Platform, Linking } from "react-native";

interface SelectedBox {
  gen: string;
  major: string;
  name: string;
  info: string;
  date: string;
  sort: string;
  status: "pending" | "completed";
}

type SortType = "인문계열" | "예술계열" | "IT계열" | "공학계열";

const gatherTownUrls: Record<SortType, string> = {
  인문계열: "nJCm-X-RR5OojtQzylwy",
  예술계열: "5RvF4SJkTl6csexWVxQw",
  IT계열: "PsbK1kvsSF2vqKIf-VLj",
  공학계열: "nWPWj7r6T8eRB2mVaUT8",
};

function isSortType(value: any): value is SortType {
  return ["인문계열", "예술계열", "IT계열", "공학계열"].includes(value);
}

function isSelectedBox(item: any): item is SelectedBox {
  return (
    typeof item.gen === "string" &&
    typeof item.major === "string" &&
    typeof item.name === "string" &&
    typeof item.info === "string" &&
    typeof item.date === "string" &&
    isSortType(item.sort) &&
    (item.status === "pending" || item.status === "completed")
  );
}

export function MentorBusPage() {
  const [filter, setFilter] = useState("entry");
  const [appliedItems, setAppliedItems] = useState<SelectedBox[]>([]);

  useEffect(() => {
    const itemsFromStorage = JSON.parse(
      localStorage.getItem("appliedItems") || "[]"
    );
    const parsedItems: SelectedBox[] = itemsFromStorage
      .map((item: any) => ({
        ...item,
        status: item.status === "completed" ? "completed" : "pending",
      }))
      .filter(isSelectedBox);
    setAppliedItems(parsedItems);
  }, []);

  const handleEnter = (item: SelectedBox) => {
    if (isSortType(item.sort)) {
      const url = `https://app.gather.town/invite?token=${
        gatherTownUrls[item.sort]
      }`;
      if (Platform.OS === "web") {
        // Web platform: open URL in new tab
        window.open(url, "_blank");
      } else {
        // Mobile platform: use Linking to open URL
        Linking.openURL(url).catch((err) =>
          console.error("Failed to open URL:", err)
        );
      }

      // Update the status of the item to "completed"
      const updatedItems = appliedItems.map((i) =>
        i === item ? { ...i, status: "completed" } : i
      );
      setAppliedItems(updatedItems as SelectedBox[]); // Type assertion here
      localStorage.setItem(
        "appliedItems",
        JSON.stringify(
          updatedItems.map((i) => ({
            ...i,
            status: i.status === "completed" ? "completed" : "pending",
          }))
        )
      );
      setFilter("applied");
    }
  };

  return (
    <>
      <div className="main">
        <div className="main_content">
          <div style={{ background: "#fff" }}>
            <div className="text-lg not-italic font-bold text-[19px] mt-[20px]">
              멘토버스
            </div>
            <div className="flex justify-between mt-[40px]">
              <div
                className={`filter_btn_label ${
                  filter === "entry" ? "active" : ""
                }`}
                onClick={() => setFilter("entry")}
              >
                진행예정
              </div>
              <div
                className={`filter_btn_label ${
                  filter === "applied" ? "active" : ""
                }`}
                onClick={() => setFilter("applied")}
              >
                진행완료
              </div>
            </div>
            <div className="mt-[35px] grid place-items-center">
              {appliedItems
                .filter((item) =>
                  filter === "entry"
                    ? item.status === "pending"
                    : item.status === "completed"
                )
                .map((item, index) => (
                  <div
                    key={index}
                    className="grid place-items-center mt-[0px] h-[120px]"
                  >
                    <SearchBox
                      gen={item.gen}
                      major={item.major}
                      name={item.name}
                      info={item.info}
                      date={item.date}
                      sort={item.sort}
                      variant="default"
                      size="default"
                      onClick={
                        filter === "entry" ? () => handleEnter(item) : undefined
                      }
                    >
                      {filter === "entry" ? "입장하기" : "진행완료"}
                    </SearchBox>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-[120px]"></div>

          <BottomNav />
        </div>
      </div>
    </>
  );
}
