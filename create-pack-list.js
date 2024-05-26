/*
 * Copyright 2023 Alexander Kiriliuk
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const Arborist = require("@npmcli/arborist");
const packList = require("npm-packlist");
const tar = require("tar");
const packageDir = process.cwd();
const packageTarball = process.cwd() + "/dist/package.tgz";

const regex =
  /^(?!.*(?:\.spec\.d\.ts|\.mock\.map\.js|\.mock\.js|\.tgz|\.tsbuildinfo|local.properties)$).*$/;
const arborist = new Arborist({ path: packageDir });
arborist.loadActual().then((tree) => {
  packList(tree)
    .then((files) => {
      const tarFiles = [];
      files.forEach((file) => {
        if (!file.startsWith("dist/examples/") && regex.test(file)) {
          tarFiles.push(file);
        }
      });
      tar.create(
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
