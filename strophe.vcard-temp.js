/*
This programm is free software under CC creative common licence!
Author: Christian Pauly
*/

/**
 * Vccard-temp Plugin for strophe.js
 *
 */


(function () {

	Strophe.addConnectionPlugin('vcard', {
		OnMetadataEvent: null,
		_connection: null,


		init: function (conn) {
			this._connection = conn;
			Strophe.addNamespace('VCARD-TEMP', 'urn:xmpp:avatar:data');
		},


		set: function( vCardObject, success_callback, error_callback )
		{
			vCardXML = "<vCard>";
			if("N" in vCardObject)
			{
				vCardXML = vCardXML + "<N>";
				if("GIVEN" in vCardObject.N) vCardXML = vCardXML + "<GIVEN>" + vCardObject.N.GIVEN + "</GIVEN>";
				if("FAMILY" in vCardObject.N) vCardXML = vCardXML + "<FAMILY>" + vCardObject.N.FAMILY + "</FAMILY>";
				vCardXML = vCardXML + "</N>";
			}
			if("X-GENDER" in vCardObject) vCardXML = vCardXML + "<X-GENDER>" + vCardObject["X-GENDER"] + "</X-GENDER>";
			if("BDAY" in vCardObject) vCardXML = vCardXML + "<BDAY>" + vCardObject.BDAY +  "</BDAY>";
			if(typeof vCardObject.MARITAL === 'object' && "STATUS" in vCardObject.MARITAL) vCardXML = vCardXML + "<MARITAL><STATUS>" + vCardObject.MARITAL.STATUS + "</STATUS></MARITAL>";
			if("ADR" in vCardObject)
			{
				vCardXML = vCardXML + "<ADR>";
				if("CTRY" in vCardObject.ADR) vCardXML = vCardXML + "<CTRY>" + vCardObject.ADR.CTRY + "</CTRY>";
				if("LOCALITY" in vCardObject.ADR) vCardXML = vCardXML + "<LOCALITY>" + vCardObject.ADR.LOCALITY + "</LOCALITY>";
				vCardXML = vCardXML + "</ADR>";
			}
			if("ROLE" in vCardObject) vCardXML = vCardXML + "<ROLE>" + vCardObject.ROLE + "</ROLE>";
			if("DESC" in vCardObject) vCardXML = vCardXML + "<DESC>" + vCardObject.DESC + "</DESC>";
			if("PHOTO" in vCardObject)
			{
				vCardXML = vCardXML + "<PHOTO>";
				if("BINVAL" in vCardObject.PHOTO) vCardXML = vCardXML + "<BINVAL>" + vCardObject.PHOTO.BINVAL + "</BINVAL>";
				if("TYPE" in vCardObject.PHOTO) vCardXML = vCardXML + "<TYPE>" + vCardObject.PHOTO.TYPE + "</TYPE>";
				vCardXML = vCardXML + "</PHOTO>";
			}
			vCardXML = vCardXML + "</vCard>";

			vCardDoc = $.parseXML(vCardXML).firstChild;

			vCardElement = vCardDoc.documentElement;

			var req=$iq({"type":"set", "id":"v2"})
			.c("vCard", {"xmlns":"vcard-temp"});
			reqxml = req.tree();
			reqxml.querySelector("vCard").append(vCardDoc);

			this._connection.sendIQ(reqxml,function(iq){
				success_callback (iq);
			},function(iq){
				var text = "";
				if(iq.querySelector("text") != null)
					text = iq.querySelector("text").innerHTML;
				error_callback({
					"error" : iq,
					"reason" : iq.querySelector("error").firstChild.tagName,
					"text" : text
				});
			});
		},


		request: function( from, success_callback, error_callback )
		{
			var req=$iq({"from": this._connection.jid, "to": Strophe.getBareJidFromJid(from), "id":"v3", "type":"get"})
			.c("vCard", {"xmlns":"vcard-temp"});

			var XMLToArray = function (xmlDoc)
		    {
		    	var thisArray = new Array();
		    	if($(xmlDoc).children().length > 0)
		    		$(xmlDoc).children().each(function()
		    		{
		    			if($(xmlDoc).find(this.nodeName).children().length > 0)
		    			{
		    				var NextNode = $(xmlDoc).find(this.nodeName);
		    				thisArray[this.nodeName] = getXMLToArray(NextNode);
		    			}
		    			else
		    				thisArray[this.nodeName] = $(xmlDoc).find(this.nodeName).text();
		    		});
		    	return thisArray;
		    }

			this._connection.sendIQ(req,
						function(iq)
						{
							var vcard = iq.querySelector("vCard");
							var arr = XMLToArray(vcard);
							if( "vCard" in arr )
								arr = arr["vCard"]
							success_callback(arr,from);
						},
						function(iq)
						{
							var text = "";
							if(iq.querySelector("text") != null)
								text = iq.querySelector("text").innerHTML;
							error_callback({
								"error" : iq,
								"from" : iq.getAttribute("from"),
								"reason" : iq.querySelector("error").firstChild.tagName,
								"text" : text
							});
						}
					);
		},





	});

})();
