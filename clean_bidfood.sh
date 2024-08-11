#!/bin/bash

# create or empty the output file first
> temp.csv

# append filtered and trimmed data to the output file
grep "Everyday Favourites" bidfood.csv | awk '{$1=$2=""; print $0}' >> temp.csv
grep "BB - " bidfood.csv | awk '{$1=$2=""; print $0}' >> temp.csv
grep "Alpro" bidfood.csv | awk '{$1=""; print $0}' >> temp.csv
grep "Beechdean Farmhouse Dairy" bidfood.csv | awk '{$1=$2=$3=""; print $0}' >> temp.csv
grep "Premium Selection" bidfood.csv | awk '{$1=$2=""; print $0}' >> temp.csv
grep "Santa Maria" bidfood.csv | awk '{$1=$2=""; print $0}' >> temp.csv
grep "Red Tractor McCain" bidfood.csv | awk '{$1=$2=$3=$4=$5=$6=""; print $0}' >> temp.csv
grep "Red Tractor Rodda" bidfood.csv | awk '{$1=$2=$3=$4=""; print $0}' >> temp.csv
grep "Simply Worldfoods" bidfood.csv | awk '{$1=$2=""; print $0}' >> temp.csv

# add all lines that do not match any of the patterns
grep -v -e "Everyday Favourites" -e "BB - " -e "Alpro" -e "Beechdean Farmhouse Dairy" \
        -e "Premium Selection" -e "Santa Maria" -e "Red Tractor McCain" \
        -e "Red Tractor Rodda" -e "Simply Worldfoods" bidfood.csv >> temp.csv

# remove leading spaces and duplicates, and save to final output file
sed 's/^[ \t]*//' temp.csv | uniq | sort > temp2.csv
echo "Product,Quantity" > output.csv
cat temp2.csv >> output.csv
rm temp.csv
rm temp2.csv
