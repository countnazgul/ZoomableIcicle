// Zoomable Icicle Qlikview Extension
// Author: stefan.stoichev@gmail.com
// Version: 0.3.0
// Repo: https://github.com/countnazgul/ZoomableIcicle
// d3 example used: http://bl.ocks.org/mbostock/1005873
// Thanks to: Cynthia Brewer for the ColorBrewer Scale http://bl.ocks.org/mbostock/5577023

var _path = Qva.Remote + "?public=only&name=Extensions/ZoomableIcicle/";
var selectedNode = '';
function extension_Init()
{
    Qva.LoadScript(_path + "jquery.js", function() {
        Qva.LoadScript(_path + "d3.min.js", function() {
          Qva.LoadScript(_path + "colorbrewer.js", extension_Done );
        });
    });
}

if (Qva.Mgr.mySelect === undefined) {
    Qva.Mgr.mySelect = function (owner, elem, name, prefix) {
        if (!Qva.MgrSplit(this, name, prefix)) return;
        owner.AddManager(this);
        this.Element = elem;
        this.ByValue = true;

        elem.binderid = owner.binderid;
        elem.Name = this.Name;

        elem.onchange = Qva.Mgr.mySelect.OnChange;
        elem.onclick = Qva.CancelBubble;
    };
    Qva.Mgr.mySelect.OnChange = function () {
        var binder = Qva.GetBinder(this.binderid);
        if (!binder.Enabled) return;
        if (this.selectedIndex < 0) return;
        var opt = this.options[this.selectedIndex];
        binder.Set(this.Name, 'text', opt.value, true);
    };
    Qva.Mgr.mySelect.prototype.Paint = function (mode, node) {
        this.Touched = true;
        var element = this.Element;
        var currentValue = node.getAttribute("value");
        if (currentValue === null) currentValue = "";
        var optlen = element.options.length;
        element.disabled = mode != 'e';

        for (var ix = 0; ix < optlen; ++ix) {
            if (element.options[ix].value === currentValue) {
                element.selectedIndex = ix;
            }
        }
        element.style.display = Qva.MgrGetDisplayFromMode(this, mode);
    };
}

function extension_Done(){
	Qva.AddExtension('ZoomableIcicle', function(){
		var _this 				= this;
		//var showValues 			= _this.Layout.Text0.text.toString();
		var fontSize 			  = _this.Layout.Text0.text.toString() + 'px';
		var fontFamily 			= _this.Layout.Text1.text.toString();
		var colorScheme 		= _this.Layout.Text2.text.toString();
		var colorSchemeNo		= _this.Layout.Text3.text.toString();
    var opacity         = parseInt(_this.Layout.Text4.text.toString()) / 100;
    var zoomSpeed       = parseInt(_this.Layout.Text5.text.toString());
    var Width           = parseInt(_this.Layout.Text6.text.toString());
    var Height          = parseInt(_this.Layout.Text7.text.toString());
    var BorderWidth          = parseFloat(_this.Layout.Text8.text.toString());
    var BorderColor          = _this.Layout.Text9.text.toString();
    var showValues = false;
        var width = Width,
        height = Height;
		// if(showValues == '' || showValues == 0) {
		//   showValues = false;
		// } else {
		//   showValues = true;
		// }
    width = 560,
    height = 400;
		var divName = _this.Layout.ObjectId.replace("\\", "_");

		if(_this.Element.children.length === 0) {
			var ui = document.createElement("div");
			ui.setAttribute("id", divName);
			_this.Element.appendChild(ui);
		} else {
			$("#" + divName).empty();
		}

          $( '#' +divName ).height( height );
          $( '#' +divName ).width( width );
          $( '#' +divName ).css({
            overflow: 'hidden'
            });          

		var td = _this.Data;
		var nodesArray = [];
		var parents = [];

		for(var rowIx = 0; rowIx < td.Rows.length; rowIx++) {

			var row = td.Rows[rowIx];

			var val1 = row[0].text;
			var val2 = row[1].text;
			var m = row[2].text;

			var node =  [{"name":val2},{"parent":val1},{"size":m}];
			nodesArray.push(node);
			parents.push(row[0].text);
		}

		var uniqueParents = parents.filter(function(itm,i,a){
			return i==a.indexOf(itm);
		});

		if( uniqueParents.length === 0 ) {
			nodesArray.push([{"name":uniqueParents[0]},{"parent":'-'},{"size":1}]);
		} else {
			if( selectedNode ) {
				for( var i = 0; i < uniqueParents.length; i++) {
					if( uniqueParents[i] == selectedNode) {
						nodesArray.push([{"name":uniqueParents[i]},{"parent":'-'},{"size":1}]);
					}
				}
			}
		}

		var nodesJson = createJSON(nodesArray);

		function createJSON(Data) {
		  var happyData = Data.map(function(d) {
		    return {
		      name: d[0].name,
		      parent: d[1].parent,
		      size: d[2].size
		    };
		  });

		  function getChildren(name) {
		    return happyData.filter(function(d) { return d.parent === name; })
		      .map(function(d) {
              var values = '';
              if( showValues === true ) {
                values = ' (' + parseInt(d.size).toLocaleString() + ')';
              }
		        return {
		          name: d.name + '' + values,
		          size: d.size,
		          children: getChildren(d.name)
		        };
		      });
		  }
		  return getChildren('-')[0];
		}

		var selectedNodes = [];
		function traverse(o ) {
			for (var i in o) {
				if (typeof(o[i])=="object") {
				  if (o[i].name) {
					selectedNodes.push((o[i].name));
				  }

				  traverse(o[i]);
				}
			}
		}

		function removeProp(obj, propName) {
		  for (var p in obj) {
  			if (obj.hasOwnProperty(p)) {
  			  if (p == propName) {
  				delete obj[p];
  			  } else if (typeof obj[p] == 'object') {
  				removeProp(obj[p], propName);
  			  }
  			}
		  }
		  return obj;
		}



    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([0, height]);
        
     var color1 = d3.scale.ordinal()
            .range( colorbrewer[colorScheme][colorSchemeNo])
     ;
     
    var color = d3.scale.category20c();
    var x_range = d3.scale.linear().range([0, width]);
    var y_range = d3.scale.linear().range([0, height]);
    var partition = d3.layout.partition()    
      .value(function(d) { return d.size; });    
            
    var svg = d3.select("#" + divName).append("svg")
        .attr("width", width)
        .attr("height", height)
    ;
        
    var rect = svg.selectAll("rect");
    var root = nodesJson;  
    var data = partition.nodes( root );

      var g = svg.selectAll("g")
          .data( data )
          .enter().append("g")
        ;

    var rect = g.append("rect")
    .attr("x", function(d) { return x_range(d.x); })
    .attr("y", function(d) { return y_range(d.y); })
    .attr("width", function(d) { return x_range(d.dx); })
    .attr("height", function(d) { return y_range(d.dy); })
    .attr("fill", function(d) {   return color(d.name);})
    .attr("bb", function(d) {        
      d.bb = this.getBBox().width;       
      return this.getBBox().width })
    .style("cursor", "pointer")
    .on("click", clicked);
    
    var fo = g.append("text")
    .attr("x", function(d) { return x_range(d.x); })
    .attr("y", function(d) { return y_range(d.y +0.03); })
    .attr("width", function(d) { return x_range(d.dx); })
    .attr("height", function(d) { return y_range(d.dy); })
    .style("cursor", "pointer")
    .attr("font-size", 14)
    .text(function(d) { return d.name })
    .attr("opacity",function(d) {  d.w = this.getComputedTextLength(); return d.bb > d.w  ? 1 : 0})
    .on("click", clicked);
  
    function clicked(d) {
      x_range.domain([d.x, d.x + d.dx]);
      y_range.domain([d.y, 1]).range([d.y ? 20 : 0, height]);
    
      rect.transition()
          .duration(750)
                .attr("x", function(d) { return x_range(d.x); })
                .attr("y", function(d) { return y_range(d.y); })
                .attr("width", function(d) { d.bb = x_range(d.x + d.dx) - x_range(d.x); return x_range(d.x + d.dx) - x_range(d.x); })
                .attr("height", function(d) { return y_range(d.y + d.dy) - y_range(d.y); })
      ;
                
      fo.transition()
          .duration(750)
          .attr("x", function(d) { return x_range(d.x); })
          .attr("y", function(d) { return y_range(d.y + 0.03); })
          .attr("width", function(d) { return x_range(d.x + d.dx) - x_range(d.x); })
          .attr("height", function(d) { return y_range(d.y + d.dy) - y_range(d.y); })
          .attr("opacity",function(d) {  
              d.w = this.getComputedTextLength(); 
              return d.bb > d.w  ? 1 : 0 })   
      ;    
    }
  })
}

extension_Init();
