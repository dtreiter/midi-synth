.PHONY: build clean copy-html install watch
	default: build

INSTALL_DIR=./node_modules/typescript/bin/
TSC=$(INSTALL_DIR)tsc

build: copy-html
	$(TSC)

clean:
	rm -rf ./build

copy-html:
	mkdir build
	find ./src -name '*.html' -type f -exec cp {} ./build/ \;

install:
	npm install

run:
	cd ./build; \
	python -m SimpleHTTPServer

watch: copy-html
	$(TSC) --watch

