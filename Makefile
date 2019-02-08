.PHONY: build clean copy-html install run watch
	default: build

TSC=./node_modules/typescript/bin/tsc
CLANG_FORMAT=./node_modules/clang-format/bin/darwin_x64/clang-format

build: copy-html
	$(TSC)

clean:
	rm -rf ./build

copy-html:
	mkdir build
	find ./src -name '*.html' -type f -exec cp {} ./build/ \;

format:
	$(CLANG_FORMAT) -i ./src/**/*.ts

install:
	npm install

run:
	cd ./build; \
	python -m SimpleHTTPServer

watch: copy-html
	$(TSC) --watch

