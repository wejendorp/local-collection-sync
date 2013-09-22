build: components lib/index.js
	component build --dev

components: component.json
	component install --dev

clean:
	rm -fr build components

test: build
	open test/index.html

test-server:
	node test/server

.PHONY: clean test