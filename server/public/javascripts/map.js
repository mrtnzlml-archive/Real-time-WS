jsPlumb.ready(function () {

	// setup some defaults for jsPlumb.
	var instance = jsPlumb.getInstance({
		Endpoint: ["Dot", {radius: 2}],
		HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2},
		ConnectionOverlays: [
			["Arrow", {
				location: 1,
				id: "arrow",
				width: 10,
				length: 10,
				foldback: 0.5
			}],
			["Label", {label: "FOO", id: "label", cssClass: "aLabel"}]
		],
		Container: "statemachine-demo"
	});

	window.jsp = instance;

	var windows = jsPlumb.getSelector(".statemachine-demo .w");

	// initialise draggable elements.
	instance.draggable(windows);

	// bind a click listener to each connection; the connection is deleted. you could of course
	// just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
	// happening.
	instance.bind("click", function (c) {
		instance.detach(c);
	});

	// bind a connection listener. note that the parameter passed to this function contains more than
	// just the new connection - see the documentation for a full list of what is included in 'info'.
	// this listener sets the connection's internal
	// id as the label overlay's text.
	instance.bind("connection", function (info) {
		info.connection.getOverlay("label").setVisible(false);
	});

	// suspend drawing and initialise.
	instance.doWhileSuspended(function () {
		var isFilterSupported = instance.isDragFilterSupported();
		// make each ".ep" div a source and give it some parameters to work with.  here we tell it
		// to use a Continuous anchor and the StateMachine connectors, and also we give it the
		// connector's paint style.  note that in this demo the strokeStyle is dynamically generated,
		// which prevents us from just setting a jsPlumb.Defaults.PaintStyle.  but that is what i
		// would recommend you do. Note also here that we use the 'filter' option to tell jsPlumb
		// which parts of the element should actually respond to a drag start.
		// here we test the capabilities of the library, to see if we
		// can provide a `filter` (our preference, support by vanilla
		// jsPlumb and the jQuery version), or if that is not supported,
		// a `parent` (YUI and MooTools). I want to make it perfectly
		// clear that `filter` is better. Use filter when you can.
		if (isFilterSupported) {
			instance.makeSource(windows, {
				filter: ".ep",
				anchor: "Continuous",
				connector: ["Flowchart"],
				connectorStyle: {strokeStyle: "#486683", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4},
				maxConnections: 5,
				onMaxConnections: function (info, e) {
					alert("Maximum connections (" + info.maxConnections + ") reached");
				}
			});
		} else {
			var eps = jsPlumb.getSelector(".ep");
			for (var i = 0; i < eps.length; i++) {
				var e = eps[i], p = e.parentNode;
				instance.makeSource(e, {
					parent: p,
					anchor: "Continuous",
					connector: ["Flowchart"],
					connectorStyle: {
						strokeStyle: "#486683",
						lineWidth: 2,
						outlineColor: "transparent",
						outlineWidth: 4
					},
					maxConnections: 5,
					onMaxConnections: function (info, e) {
						alert("Maximum connections (" + info.maxConnections + ") reached");
					}
				});
			}
		}
	});

	// initialise all '.w' elements as connection targets.
	instance.makeTarget(windows, {
		dropOptions: {hoverClass: "dragHover"},
		anchor: "Continuous",
		allowLoopback: true
	});

	// and finally, make a couple of connections
	instance.connect({source: "temp1", target: "temp2"});
	instance.connect({source: "temp1", target: "temp3"});
	instance.connect({source: "temp1", target: "temp4"});
	instance.connect({source: "temp1", target: "temp5"});

	instance.connect({source: "temp2", target: "temp3"});
	instance.connect({source: "temp2", target: "temp4"});
	instance.connect({source: "temp2", target: "temp5"});

	instance.connect({source: "temp3", target: "temp4"});
	instance.connect({source: "temp3", target: "temp5"});

	instance.connect({source: "temp5", target: "temp4"});

	jsPlumb.fire("jsPlumbDemoLoaded", instance);

});
