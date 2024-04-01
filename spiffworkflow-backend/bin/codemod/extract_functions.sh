#!/usr/bin/env bash

function error_handler() {
  >&2 echo "Exited with BAD EXIT CODE '${2}' in ${0} script at line: ${1}."
  exit "$2"
}
trap 'error_handler ${LINENO} $?' ERR
set -o errtrace -o errexit -o nounset -o pipefail

function_name=$1
filename=$2

python spiffworkflow-backend/bin/codemod/extract_functions.py "$filename" "$function_name"
function_body=$(python spiffworkflow-backend/bin/codemod/extract_functions.py "$filename" "$function_name")

# Extract function calls and recursively extract their bodies
while IFS= read -r line; do
  if [[ "$line" =~ ^Function:\ (.*)$ ]]; then
    called_function="${BASH_REMATCH[1]}"
    echo "$line"
    echo "$function_body" | grep -q "Function: $called_function" || ./extract_functions.sh "$called_function" "$filename"
  fi
done <<<"$function_body"
