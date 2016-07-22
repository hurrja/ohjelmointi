all: index.html

index.html: index-runko preamble
	sed -e "/PREAMBLE/r preamble" -e "s///" > $@

