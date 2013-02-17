build:
	rm -rf build
	cp -r src build

	# Minify templates
	java -jar util/htmlcompressor-1.5.3.jar --remove-surrounding-spaces all --recursive --type html -o build/templates build/templates

	# Minify Javascript
	for j in build/_attachments/js/*.js; do \
		java -jar util/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file "$$j.out" "$$j"; \
		mv "$$j.out" "$$j"; \
	done

	# Minify Css
	for c in build/_attachments/css/*.css; do \
		java -jar util/yuicompressor-2.4.8pre.jar --type css -o "$$c.out" "$$c"; \
		mv "$$c.out" "$$c"; \
	done

push:
	cd build && erica push

clean:
	rm -rf build
