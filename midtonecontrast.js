#include <pjsr/Sizer.jsh> 
#include <pjsr/NumericControl.jsh>
#include <pjsr/FrameStyle.jsh>

#feature-icon  midtonethumb.svg
#feature-id    MidtoneMaskContrast : Utilities > Midtone Mask Contrast | Post Editing Scripts > Midtone Mask Contrast
#feature-info Creates a midtone mask, applies a curves transformation using the mask, then force-closes the mask windows using forceClose()

#define TITLE "Mid Tone Contrast" 
#define VERSION "0.1"

// Global parameters.
var MidtoneParameters = {
   applyMidtone: false,
   lowMidtoneRange: false,
   highMidtoneRange: false,
   targetView: undefined,

   save: function() {
      Parameters.set("applyMidtone", this.applyMidtone);
      Parameters.set("lowMidtoneRange", this.lowMidtoneRange);
      Parameters.set("highMidtoneRange", this.highMidtoneRange);
   },

   load: function() {
      if (Parameters.has("applyMidtone"))
         this.applyMidtone = Parameters.getBoolean("applyMidtone");
      if (Parameters.has("lowMidtoneRange"))
         this.lowMidtoneRange = Parameters.getBoolean("lowMidtoneRange");
      if (Parameters.has("highMidtoneRange"))
         this.highMidtoneRange = Parameters.getBoolean("highMidtoneRange");
   }
};

// Helper: Iterate over ImageWindow.windows and return the window whose mainView.id matches winId.
function findImageWindowById(winId) {
   for (var i = 0; i < ImageWindow.windows.length; i++) {
      if (ImageWindow.windows[i].mainView.id === winId)
         return ImageWindow.windows[i];
   }
   return null;
}

// --- Mask Creation Functions ---
function applyMidtoneMask(view) {
   var P = new PixelMath;
   P.expression = "0.25 * ((1 / (1 + exp(-5 * ($T - 0.25)))) * (1 - (1 / (1 + exp(-5 * ($T - 0.75))))))";
   P.useSingleExpression = true;
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.generateOutput = true;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.truncate = true;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = "midtone_mask";
   P.newImageColorSpace = PixelMath.prototype.Gray;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   P.executeOn(view);
   
   var newWin = findImageWindowById("midtone_mask");
   if (newWin) {
      var conv = new Convolution;
      conv.mode = Convolution.prototype.Parametric;
      conv.sigma = 1.00;
      conv.shape = 2.00;
      conv.aspectRatio = 1.00;
      conv.rotationAngle = 0.00;
      conv.filterSource = "";
      conv.rescaleHighPass = false;
      conv.executeOn(newWin.mainView);
   }
}

function applyLowMidtoneMask(view) {
   var P = new PixelMath;
   P.expression = "0.25 * ((1 / (1 + exp(-10 * ($T - 0.1)))) * (1 - (1 / (1 + exp(-10 * ($T - 0.9))))))";
   P.useSingleExpression = true;
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.generateOutput = true;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.truncate = true;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = "low_midtone_mask";
   P.newImageColorSpace = PixelMath.prototype.Gray;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   P.executeOn(view);
   
   var newWin = findImageWindowById("low_midtone_mask");
   if (newWin) {
      var conv = new Convolution;
      conv.mode = Convolution.prototype.Parametric;
      conv.sigma = 1.00;
      conv.shape = 2.00;
      conv.aspectRatio = 1.00;
      conv.rotationAngle = 0.00;
      conv.filterSource = "";
      conv.rescaleHighPass = false;
      conv.executeOn(newWin.mainView);
   }
}

function applyHighMidtoneMask(view) {
   var P = new PixelMath;
   P.expression = "0.5 * ((1 / (1 + exp(-10 * ($T - 0.1)))) * (1 - (1 / (1 + exp(-10 * ($T - 0.9))))))";
   P.useSingleExpression = true;
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.generateOutput = true;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.truncate = true;
   P.createNewImage = true;
   P.showNewImage = true;
   P.newImageId = "high_midtone_mask";
   P.newImageColorSpace = PixelMath.prototype.Gray;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   P.executeOn(view);
   
   var newWin = findImageWindowById("high_midtone_mask");
   if (newWin) {
      var conv = new Convolution;
      conv.mode = Convolution.prototype.Parametric;
      conv.sigma = 1.00;
      conv.shape = 2.00;
      conv.aspectRatio = 1.00;
      conv.rotationAngle = 0.00;
      conv.filterSource = "";
      conv.rescaleHighPass = false;
      conv.executeOn(newWin.mainView);
   }
}

// --- Mask Application ---
function applyMaskToView(maskId, targetView) {
   var targetWin = targetView.window;
   var maskWin = findImageWindowById(maskId);
   if (maskWin != null) {
      if (targetWin.isMaskCompatible(maskWin)) {
         targetWin.mask = maskWin;
         targetWin.maskEnabled = true;
         targetWin.maskVisible = true;
         targetWin.maskInverted = false;
         targetWin.maskMode = 0; // default red visualization
      }
      else {
         Console.writeln("Target window is not mask compatible with " + maskId);
      }
   }
   else {
      Console.writeln("Mask window " + maskId + " not found.");
   }
}

// --- Curves Adjustment ---
function applyCurvesAdjustment(targetView) {
   var C = new CurvesTransformation;
   C.R = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.Rt = CurvesTransformation.prototype.AkimaSubsplines;
   C.G = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.Gt = CurvesTransformation.prototype.AkimaSubsplines;
   C.B = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.Bt = CurvesTransformation.prototype.AkimaSubsplines;
   C.K = [[0.00000, 0.00000], [0.33075, 0.16279], [0.58656, 0.71576], [1.00000, 1.00000]];
   C.Kt = CurvesTransformation.prototype.AkimaSubsplines;
   C.A = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.At = CurvesTransformation.prototype.AkimaSubsplines;
   C.L = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.Lt = CurvesTransformation.prototype.AkimaSubsplines;
   C.a = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.at = CurvesTransformation.prototype.AkimaSubsplines;
   C.b = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.bt = CurvesTransformation.prototype.AkimaSubsplines;
   C.c = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.ct = CurvesTransformation.prototype.AkimaSubsplines;
   C.H = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.Ht = CurvesTransformation.prototype.AkimaSubsplines;
   C.S = [[0.00000, 0.00000], [1.00000, 1.00000]];
   C.St = CurvesTransformation.prototype.AkimaSubsplines;
   C.executeOn(targetView);
}

// --- Force Close Mask Windows Using forceClose() ---
function forceCloseMaskWindows() {
   for (var i = ImageWindow.windows.length - 1; i >= 0; i--) {
      var w = ImageWindow.windows[i];
      if (w.mainView.id.indexOf("mask") !== -1) {
         if (w.mainView.image)
            w.mainView.image.modified = false;
         try {
            if (typeof w.forceClose === "function")
               w.forceClose();
            else
               w.close(true);
         }
         catch(e) {
            Console.writeln("Error force closing window " + w.mainView.id + ": " + e);
         }
      }
   }
}

// --- Dialog ---
function MidtoneDialog() {
   this.__base__ = Dialog;
   this.__base__();

   var self = this;
   this.minWidth = 340;

   // Header
   this.headerLabel = new Label(this);
   this.headerLabel.backgroundColor = 0xffDBEDFF;
   this.headerLabel.textColor = 0xff4b0082;
   this.headerLabel.useRichText = true;
   this.headerLabel.textAlignment = TextAlign_Center | TextAlign_VertCenter;
   this.headerLabel.margin = 4;
   this.headerLabel.text = "<p><b>" + TITLE + " - Version " + VERSION + "</b></p>";

   // Information (without a frame style box)
   this.infoLabel = new Label(this);
   this.infoLabel.frameStyle = FrameStyle_Box;
   this.infoLabel.margin = 4;
   this.infoLabel.wordWrapping = true;
   this.infoLabel.useRichText = true;
   this.infoLabel.text = "<p><b>Description:</b><br>" +
                         "This is a script for making better contrast on <b>non-linear</b> images." +
                         "<br><br>&copy; Neven Krcmarek 2025</p>";

   // View list
   this.viewList = new ViewList(this);
   this.viewList.getMainViews();
   this.viewList.onViewSelected = function(view) {
      MidtoneParameters.targetView = view;
      Console.writeln("Selected view: " + view.id);
   };

   // Changed checkbox names
   this.applyCheckBox = new CheckBox(this);
   this.applyCheckBox.text = "Low Midtone Contrast";
   this.applyCheckBox.checked = MidtoneParameters.applyMidtone;
   this.applyCheckBox.onCheck = function(checked) {
      MidtoneParameters.applyMidtone = checked;
   };

   this.lowMidtoneCheckBox = new CheckBox(this);
   this.lowMidtoneCheckBox.text = "Medium Midtone Contrast";
   this.lowMidtoneCheckBox.checked = MidtoneParameters.lowMidtoneRange;
   this.lowMidtoneCheckBox.onCheck = function(checked) {
      MidtoneParameters.lowMidtoneRange = checked;
   };

   this.highMidtoneCheckBox = new CheckBox(this);
   this.highMidtoneCheckBox.text = "High Midtone Contras";
   this.highMidtoneCheckBox.checked = MidtoneParameters.highMidtoneRange;
   this.highMidtoneCheckBox.onCheck = function(checked) {
      MidtoneParameters.highMidtoneRange = checked;
   };

   this.execButton = new PushButton(this);
   this.execButton.text = "Execute";
   this.execButton.width = 40;
   this.execButton.onClick = function() { self.ok(); };

   this.newInstanceButton = new ToolButton(this);
   this.newInstanceButton.icon = this.scaledResource(":/process-interface/new-instance.png");
   this.newInstanceButton.setScaledFixedSize(24, 24);
   this.newInstanceButton.onMousePress = function() {
      MidtoneParameters.save();
      self.newInstance();
   };

   this.bottomSizer = new HorizontalSizer;
   this.bottomSizer.margin = 8;
   this.bottomSizer.add(this.newInstanceButton);
   this.bottomSizer.addStretch();
   this.bottomSizer.add(this.execButton);

   this.sizer = new VerticalSizer;
   // Add header and info at the top
   this.sizer.add(this.headerLabel);
   this.sizer.addSpacing(5);
   this.sizer.add(this.infoLabel);
   this.sizer.addSpacing(5);
   this.sizer.add(this.viewList);
   this.sizer.addSpacing(5);
   this.sizer.add(this.applyCheckBox);
   this.sizer.addSpacing(5);
   this.sizer.add(this.lowMidtoneCheckBox);
   this.sizer.addSpacing(5);
   this.sizer.add(this.highMidtoneCheckBox);
   this.sizer.addSpacing(5);
   this.sizer.add(this.bottomSizer);
   this.sizer.addStretch();
   this.sizer.margin = 8;

   this.windowTitle = "Midtone Contrast Script";
   this.adjustToContents();
}

MidtoneDialog.prototype = new Dialog;

function showDialog() {
   var dialog = new MidtoneDialog;
   return dialog.execute();
}

// --- Main ---
function main() {
   if (Parameters.isViewTarget) {
      MidtoneParameters.load();
      if (MidtoneParameters.applyMidtone) {
         applyMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("midtone_mask", MidtoneParameters.targetView);
      }
      if (MidtoneParameters.lowMidtoneRange) {
         applyLowMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("low_midtone_mask", MidtoneParameters.targetView);
      }
      if (MidtoneParameters.highMidtoneRange) {
         applyHighMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("high_midtone_mask", MidtoneParameters.targetView);
      }
      // With the mask active, apply the curves adjustment.
      applyCurvesAdjustment(MidtoneParameters.targetView);
      // Force-close mask windows using forceClose() (or close(true) as fallback).
      forceCloseMaskWindows();
      return;
   }
   else if (Parameters.isGlobalTarget) {
      MidtoneParameters.load();
   }
   
   var retVal = showDialog();
   if (retVal == 1) {
      Console.writeln("Apply midtone mask: " + MidtoneParameters.applyMidtone);
      Console.writeln("Low midtone mask: " + MidtoneParameters.lowMidtoneRange);
      Console.writeln("High midtone mask: " + MidtoneParameters.highMidtoneRange);
      Console.writeln("Target view: " + MidtoneParameters.targetView.id);
      if (MidtoneParameters.applyMidtone) {
         applyMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("midtone_mask", MidtoneParameters.targetView);
      }
      if (MidtoneParameters.lowMidtoneRange) {
         applyLowMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("low_midtone_mask", MidtoneParameters.targetView);
      }
      if (MidtoneParameters.highMidtoneRange) {
         applyHighMidtoneMask(MidtoneParameters.targetView);
         applyMaskToView("high_midtone_mask", MidtoneParameters.targetView);
      }
      applyCurvesAdjustment(MidtoneParameters.targetView);
      forceCloseMaskWindows();
   }
}

main();
