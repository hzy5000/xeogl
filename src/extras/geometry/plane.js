/**
 A **Plane** defines a plane geometry for attached {{#crossLink "GameObject"}}GameObjects{{/crossLink}}.

 ## Example

 ````javascript

 ````

 @class Plane
 @module XEO
 @submodule geometry
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}Scene{{/crossLink}} - creates this Plane in the default
 {{#crossLink "Scene"}}Scene{{/crossLink}} when omitted.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent {{#crossLink "Scene"}}Scene{{/crossLink}},
 generated automatically when omitted.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata to attach to this Plane.
 @param [cfg.xSize=1] {Number} Dimension on the X-axis.
 @param [cfg.ySize=1] {Number} Dimension on the Y-axis.
 @param [cfg.xSegments=4] {Number} Number of segments on the X-axis.
 @param [cfg.ySegments=4] {Number} Number of segments on the Y-axis.

 @param [cfg.lod=1] {Number} Level-of-detail, in range [0..1].
 @extends Geometry
 */
(function () {

    "use strict";

    XEO.Plane = XEO.Geometry.extend({

        type: "XEO.Plane",

        _init: function (cfg) {

            this._super(cfg);

            this.xSize = cfg.xSize;
            this.ySize = cfg.ySize;

            this.xSegments = cfg.xSegments;
            this.ySegments = cfg.ySegments;

            this.lod = cfg.lod;

            this.autoNormals = cfg.autoNormals !== false;
        },

        _gridDirty: function () {
            if (!this.__dirty) {
                this.__dirty = true;
                var self = this;
                this.scene.once("tick2",
                    function () {
                        self._buildGrid();
                        self.__dirty = false;
                    });
            }
        },

        _buildGrid: function () {

                // Geometry needs rebuild

                var width = this._xSize;
                var height = this._ySize;

                var xSegments = Math.floor(this._lod * this._xSegments);
                var ySegments = Math.floor(this._lod * this._ySegments);

                if (ySegments < 4) {
                    ySegments = 4;
                }

                if (ySegments < 4) {
                    ySegments = 4;
                }

                var halfWidth = width / 2;
                var halfHeight = height / 2;

                var gridX = Math.floor( xSegments ) || 1;
                var gridY = Math.floor( ySegments ) || 1;

                var gridX1 = gridX + 1;
                var gridY1 = gridY + 1;

                var segmentWidth = width / gridX;
                var segmentHeight = height / gridY;

                var positions = new Float32Array( gridX1 * gridY1 * 3 );
                var normals = new Float32Array( gridX1 * gridY1 * 3 );
                var uvs = new Float32Array( gridX1 * gridY1 * 2 );

                var offset = 0;
                var offset2 = 0;

                for ( var iy = 0; iy < gridY1; iy ++ ) {

                    var y = iy * segmentHeight - halfHeight;

                    for ( var ix = 0; ix < gridX1; ix ++ ) {

                        var x = ix * segmentWidth - halfWidth;

                        positions[ offset ] = x;
                        positions[ offset + 1 ] = - y;

                        normals[offset + 2] = -1;

                        uvs[offset2] = (gridX -ix) / gridX;
                        uvs[offset2 + 1] = 1 - ( (gridY-iy) / gridY );

                        offset += 3;
                        offset2 += 2;
                    }
                }

                offset = 0;

                var indices = new ( ( positions.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( gridX * gridY * 6 );

                for ( var iy = 0; iy < gridY; iy ++ ) {

                    for ( var ix = 0; ix < gridX; ix ++ ) {

                        var a = ix + gridX1 * iy;
                        var b = ix + gridX1 * ( iy + 1 );
                        var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
                        var d = ( ix + 1 ) + gridX1 * iy;

                        indices[offset] = d;
                        indices[offset + 1] = b;
                        indices[offset + 2] = a;

                        indices[offset + 3] = d;
                        indices[offset + 4] = c;
                        indices[offset + 5] = b;

                        offset += 6;
                    }
                }

                this.positions = positions;
                this.normals = normals;
                this.uv = uvs;
                this.indices = indices;
        },

      
        _props: {

            /**
             * The Plane's level-of-detail factor.
             *
             * Fires a {{#crossLink "Plane/lod:event"}}{{/crossLink}} event on change.
             *
             * @property lod
             * @default 1
             * @type Number
             */
            lod: {

                set: function (value) {

                    value = value !== undefined ? value : 1;

                    if (this._lod === value) {
                        return;
                    }

                    if (value < 0 || value > 1) {
                        this.warn("clamping lod to [0..1]");
                        value = value < 0 ? 0 : 1;
                    }

                    this._lod = value;

                    this._gridDirty();

                    /**
                     * Fired whenever this Plane's {{#crossLink "Plane/lod:property"}}{{/crossLink}} property changes.
                     * @event lod
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("lod", this._lod);
                },

                get: function () {
                    return this._lod;
                }
            },
            
            /**
             * The Plane's dimension on the X-axis.
             *
             * Fires a {{#crossLink "Plane/xSize:event"}}{{/crossLink}} event on change.
             *
             * @property xSize
             * @default 1
             * @type Number
             */
            xSize: {

                set: function (value) {

                    value = value || 1;

                    if (this._xSize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSize not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSize = value;

                    this._gridDirty();

                    /**
                     * Fired whenever this Plane's {{#crossLink "Plane/xSize:property"}}{{/crossLink}} property changes.
                     * @event xSize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSize", this._xSize);
                },

                get: function () {
                    return this._xSize;
                }
            },

            /**
             * The Plane's dimension on the Y-axis.
             *
             * Fires a {{#crossLink "Plane/ySize:event"}}{{/crossLink}} event on change.
             *
             * @property ySize
             * @default 0.25
             * @type Number
             */
            ySize: {

                set: function (value) {

                    value = value || 0.25;

                    if (this._ySize === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative ySize not allowed - will invert");
                        value = value * -1;
                    }

                    this._ySize = value;

                    this._gridDirty();

                    /**
                     * Fired whenever this Plane's {{#crossLink "Plane/ySize:property"}}{{/crossLink}} property changes.
                     * @event ySize
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("ySize", this._ySize);
                },

                get: function () {
                    return this._ySize;
                }
            },
            
            /**
             * The Plane's number of segments on the X-axis.
             *
             * Fires a {{#crossLink "Plane/xSegments:event"}}{{/crossLink}} event on change.
             *
             * @property xSegments
             * @default 4
             * @type Number
             */
            xSegments: {

                set: function (value) {

                    value = value || 4;

                    if (this._xSegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative xSegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._xSegments = value;

                    this._gridDirty();

                    /**
                     * Fired whenever this Plane's {{#crossLink "Plane/xSegments:property"}}{{/crossLink}} property changes.
                     * @event xSegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("xSegments", this._xSegments);
                },

                get: function () {
                    return this._xSegments;
                }
            },

            /**
             * The Plane's number of segments on the Y-axis.
             *
             * Fires a {{#crossLink "Plane/ySegments:event"}}{{/crossLink}} event on change.
             *
             * @property ySegments
             * @default 4
             * @type Number
             */
            ySegments: {

                set: function (value) {

                    value = value || 4;

                    if (this._ySegments === value) {
                        return;
                    }

                    if (value < 0) {
                        this.warn("negative ySegments not allowed - will invert");
                        value = value * -1;
                    }

                    this._ySegments = value;

                    this._gridDirty();

                    /**
                     * Fired whenever this Plane's {{#crossLink "Plane/ySegments:property"}}{{/crossLink}} property changes.
                     * @event ySegments
                     * @type Number
                     * @param value The property's new value
                     */
                    this.fire("ySegments", this._ySegments);
                },

                get: function () {
                    return this._ySegments;
                }
            }
        },

        _getJSON: function () {
            return {
                xSize: this._xSize,
                ySize: this._ySize,
                xSegments: this._xSegments,
                ySegments: this._ySegments
            };
        }
    });

})();
