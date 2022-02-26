from textwrap import indent
import json
import pathlib


def writeToFile(fileName, results):
    with open(
        f"{pathlib.Path(__file__).parent.resolve()}/results/{fileName}.json", "w"
    ) as file:
        print(f"Writing {fileName}...")
        json.dump(results, file, ensure_ascii=True, indent=2)
