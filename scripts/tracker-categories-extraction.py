# Tracker Category Analysis
# ==========================
# Sources:
#   - DuckDuckGo Tracker Radar (DuckDuckGo, Inc., 2025)
#     -> https://spreadprivacy.com/duckduckgo-tracker-radar/
#
# Purpose: research/visualisation for inspecting category distribution


import os
import json
from collections import defaultdict
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_json(filename: str) -> dict:
    path = os.path.join(BASE_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_categories(data_list: list[dict]) -> dict[str, int]:
    categories: dict[str, int] = defaultdict(int)
    for data in data_list:
        for info in data.get("trackers", {}).values():
            for c in info.get("c", []):
                categories[c] += 1
    return categories


def plot_categories(categories: dict[str, int]) -> None:
    sorted_data = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    names = [x[0] for x in sorted_data[:15]]
    values = [x[1] for x in sorted_data[:15]]
    plt.figure()
    plt.barh(names, values)
    plt.xlabel("Count")
    plt.title("Top Tracker-Categories (DDG Tracker Radar)")
    plt.tight_layout()
    plt.show()


def main() -> None:
    core = load_json("../src/data/trackers/tracker-core.json")
    extended = load_json("../src/data/trackers/tracker-extended.json")

    categories = extract_categories([core, extended])

    print("Found Categories:\n")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}")

    plot_categories(categories)


if __name__ == "__main__":
    main()
