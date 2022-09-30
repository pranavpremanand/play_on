const multer = require("multer");
const bannerModel = require("../models/banner-model");

//CONFIGURATION OF MULTER
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/banner");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `banner-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

//MULTER FILTER
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "jpg" || "jpeg" || "png" || "webp") {
    cb(null, true);
  } else {
    cb(new Error("Not a JPG File!"), false);
  }
};

//CALLING THE MULTER FUNCTION
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadBanner = upload.single("image");

exports.addBanner = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      await bannerModel.deleteMany();
      const bannerData = {
        title: data.title,
        description: data.description,
        image: data.banner,
        // textColor: data.textColor,
        productCategory: data.productCategory,
      };
      const banner = new bannerModel(bannerData);
      banner.save(() => {
        resolve(true);
      });
    } catch (err) {
      reject(err);
    }
  });
};
