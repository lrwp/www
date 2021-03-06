build: clean

	# move everything in src into build
	cp -r src build

	# don't need node files in couch
	# though .ericaignore should always prevent this
	# from being pushed
	rm -rf build/nodejs

	# Minify templates
	java -jar util/htmlcompressor-1.5.3.jar --remove-surrounding-spaces all --recursive --type html -o build/templates build/templates

	# Minify Javascript
	for j in build/_attachments/js/*.js; do \
		echo "Compressing: $$j"; \
		java -jar util/compiler.jar --warning_level QUIET --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file "$$j.out" "$$j"; \
		mv "$$j.out" "$$j"; \
	done

	# Minify Some libs
	for j in build/_attachments/js/lib/bootstrap-custom.js; do \
		echo "Compressing: $$j"; \
		java -jar util/compiler.jar --warning_level QUIET --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file "$$j.out" "$$j"; \
		mv "$$j.out" "$$j"; \
	done

	# Minify Css
	for c in build/_attachments/css/*.css; do \
		echo "Minifying $$c"; \
		java -jar util/yuicompressor-2.4.8pre.jar --type css -o "$$c.out" "$$c"; \
		mv "$$c.out" "$$c"; \
	done

	# Optimize JPEGs
	for j in $$(find build/ -name "*.jpg" -or -name "*.jpeg"); do \
		echo "Optimizing $$j"; \
		before=`wc -c < "$$j"`; \
		jpegtran -progressive -copy none -optimize "$$j"  > "$$j.out"; \
		after=`wc -c < "$$j.out"`; \
		if [ "$$before" -gt "$$after" ]; \
		then \
			mv "$$j.out" "$$j"; \
		else \
			echo "No savings: $$j"; \
			rm "$$j.out"; \
		fi \
	done

	# Crush PNGs
	for p in $$(find build/ -name "*.png" ); do \
		echo "Crushing $$p"; \
		before=`wc -c < "$$p"`; \
		pngcrush -q -rem allb -brute -reduce "$$p" "$$p.out"; \
		after=`wc -c < "$$p.out"`; \
		if [ "$$before" -gt "$$after" ]; \
		then \
			mv "$$p.out" "$$p"; \
		else \
			echo "No savings: $$p"; \
			rm "$$p.out"; \
		fi \
	done

gzip: 

	for i in $$(find build/ -name "*.js" -or -name "*.css"); do \
		echo "Gziping $$i"; \
		before=`wc -c < "$$i"`; \
		gzip -9 -c "$$i" > "$$i.out"; \
		after=`wc -c < "$$i.out"`; \
		if [ "$$before" -gt "$$after" ]; \
		then \
			mv "$$i.out" "$$i.gz"; \
		else \
			echo "No savings: $$i"; \
			rm "$$i.out"; \
		fi \
	done

push:
	cd build && erica push

lint:

	# Lint JavaScript
	for j in src/_attachments/js/*.js; do \
		echo "Linting $$j"; \
		node_modules/.bin/jslint --nomen --predef "$$" --browser "$$j"; \
	done

clean:
	rm -rf build
