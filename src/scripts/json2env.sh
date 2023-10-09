#!/bin/sh
tr -d '\n' |
  grep -o '"[A-Za-z_][A-Za-z_0-9]\+"\s*:\s*\("[^"]\+"\|[0-9\.]\+\|true\|false\|null\)' |
  sed 's/"\([A-Za-z_][A-Za-z_0-9]\+"\)\s*:\s*true/\1=true/;
       s/"\([A-Za-z_][A-Za-z_0-9]\+"\)\s*:\s*false/\1=false/;
       s/"\(.*\)"\s*:\s*"\?\([^"]\+\)"\?/\1= "\2"/'