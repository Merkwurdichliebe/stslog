# Description

Generate a bare-bones log in markdown format from a Slay the Spire run file.

# Usage

### Find the required `.run` file

- macOS: `/Users/{username}/Library/Application\ Support/Steam/steamapps/common/SlayTheSpire/SlayTheSpire.app/Contents/Resources/runs`

### Run the script, passing the file as an argument

If inside the above folder, simply do (your file name will vary):

`python stslog.py 1748809706.run`

### Output to file

To output to a file for easier copying and pasting:

`python stslog.py 1748809706.run > filename.md`

# Disclaimer

This quic and dirty script was written for quick online posting of run details, for discussion and learning purpose. It is not affiliated with, endorsed by, or in any way officially connected with [Mega Crit Games](https://www.megacrit.com/), or any of its subsidiaries or affiliates.
