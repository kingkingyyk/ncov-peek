ng build --prod --output-path docs --base-href /ncov-peek/ &&^
git add -A * &&^
git commit -m %1 &&^
git push

