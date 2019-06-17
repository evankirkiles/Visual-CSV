# Visual-CSV
Browser tool for visualizing CSV files

![Screenshot](screenshot1.png?raw=true "Title")

Allows for filtering and dropping columns of .csv files easily. Any layout produced by the filters can be exported through the Download button, and the tool of course works for more easily seeing discrepancies between columns or rows, especially in boolean files which it applies the coloring seen above to. There are currently two filter types: EQUALS and CONTAINS, which do exactly what their names imply given string values to compare to. Also, there is a search function which runs on all columns with the CONTAINS search type. One major problem is the handling of data types when sorting columns; currently, integer values are sorted by their string comparisons (1, 10, 100, 20, 2, etc.). There's no need for me to fix it at the moment so I haven't.

To run it yourself, you can run a PHP dev server––simply navigate to the repository and run `php -S 127.0.0.1:8080` which will start the site on the localhost ip it was provided (127.0.0.1:8080).
