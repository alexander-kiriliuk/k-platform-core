const fs = require("fs-extra");
const Arborist = require("@npmcli/arborist");
const packList = require("npm-packlist");
const tar = require("tar");
const glob = require("glob");
const path = require("path");

const packageDir = process.cwd();
const packageTarball = path.join(packageDir, "dist", "package.tgz");
const regex =
  /^(?!.*(?:\.spec\.d\.ts|\.mock\.map\.js|\.mock\.js|\.tgz|\.tsbuildinfo|local.properties)$).*$/;
const arborist = new Arborist({ path: packageDir });

arborist.loadActual().then((tree) => {
  packList(tree)
    .then(async (files) => {
      const tarFiles = [];
      files.forEach((file) => {
        if (!file.startsWith("dist/examples/") && regex.test(file)) {
          tarFiles.push(file);
        }
      });
      const libFiles = glob
        .sync("lib/**/*.*", {
          cwd: packageDir,
        })
        .filter(
          (file) =>
            regex.test(file) &&
            !file.endsWith(".ts") &&
            !(file.startsWith("tsconfig") && file.endsWith(".json")),
        );
      await Promise.all(
        libFiles.map((file) => {
          const src = path.join(packageDir, file);
          const dest = path.join(packageDir, "dist", "core", file);
          tarFiles.push(path.relative(packageDir, dest));
          return fs
            .ensureDir(path.dirname(dest))
            .then(() => fs.copy(src, dest));
        }),
      );
      return tar.create(
        {
          prefix: "package/",
          cwd: packageDir,
          file: packageTarball,
          gzip: true,
        },
        tarFiles,
      );
    })
    .then(() => {
      console.log("Tarball has been created");
    });
});
