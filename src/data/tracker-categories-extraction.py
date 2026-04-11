import os
import json
from collections import defaultdict
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_json(filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_categories(data_list):
    categories = defaultdict(int)

    for data in data_list:
        trackers = data.get("trackers", {})

        for info in trackers.values():
            for c in info.get("c", []):
                categories[c] += 1

    return categories


def plot_categories(categories):
    # sortieren (wichtig!)
    sorted_data = sorted(categories.items(), key=lambda x: x[1], reverse=True)

    names = [x[0] for x in sorted_data[:15]]
    values = [x[1] for x in sorted_data[:15]]

    plt.figure()
    plt.barh(names, values)

    plt.xlabel("Anzahl")
    plt.title("Top Tracker-Kategorien")

    plt.tight_layout()
    plt.show()


def main():
    data1 = load_json("tracker-core.json")
    data2 = load_json("tracker-extended.json")

    categories = extract_categories([data1, data2])

    print("Gefundene Kategorien:\n")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"{cat}: {count}")

    plot_categories(categories)


if __name__ == "__main__":
    main()