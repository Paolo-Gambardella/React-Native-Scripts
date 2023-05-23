import { GluegunToolbox } from 'gluegun'
import { promptBlankParam, runPrettier } from '../../utils'

export const description = 'Update native files to match current env'

export const run = async (toolbox: GluegunToolbox): Promise<void> => {
  const { filesystem, parameters, print, patching } = toolbox

  // validation
  // example-v1.0.0 or 1.0.0-example
  const env = await promptBlankParam(
    toolbox,
    parameters.first,
    "What's the env (staging/production)"
  )

  const version = await promptBlankParam(
    toolbox,
    parameters.first,
    "What's the version"
  )

  const buildNumber = await promptBlankParam(
    toolbox,
    parameters.first,
    "What's the build number"
  )

  // Get env informations (stage and version)
  const envNameSpinner = print.spin('Getting env informations... 🧑‍🍳')
  if (!version.match(/^\d.\d.\d/)) {
    // 1.0.0-example
    envNameSpinner.fail('Env is not matching example-v1.0.0 or 1.0.0-example')
    return
  }
  envNameSpinner.succeed(
    'Env: ' + env + ', Version: ' + version + ', Build number: ' + buildNumber
  )

  // Get Expo SDK version
  const expoSpinner = print.spin('Getting Expo SDK version... 🧑‍🍳')
  const packageJson = JSON.parse(await filesystem.readAsync('package.json'))
  let sdkVersion: string = packageJson.dependencies.expo
  if (!sdkVersion) {
    expoSpinner.fail("Can't get Expo SDK version from package.json")
    return
  }
  sdkVersion = sdkVersion.replace('^', '')
  expoSpinner.succeed('Expo SDK version is ' + sdkVersion)

  // Validate native projects
  const spinner = print.spin('Checking native projects... 🧑‍🍳')
  const exploPlist = (
    await filesystem.findAsync('ios', {
      matching: '**/Supporting/Expo.plist',
    })
  )[0]
  const infoPlist = (
    await filesystem.findAsync('ios', {
      matching: '**/Info.plist',
    })
  )[0]
  const androidManifest = 'android/app/src/main/AndroidManifest.xml'
  const appBuildGradle = 'android/app/build.gradle'

  if (
    !filesystem.exists(exploPlist) ||
    !filesystem.exists(androidManifest) ||
    !filesystem.exists(infoPlist) ||
    !filesystem.exists(appBuildGradle)
  ) {
    spinner.fail(
      'Native projects are not valids (Expo.plist, AndroidManifest.xml, Info.plist or app/build.gradle are missing)'
    )
    return
  }
  spinner.succeed('Native projects are valids 🧖‍♂️')

  // Update .env
  const envSpinner = print.spin('Updating env... 🙈')
  await patching.patch('app.config.js', {
    insert: "const env = '" + env + "'",
    replace: /.*const env.*/gm,
  })
  envSpinner.succeed('Env set to ' + env + ' 👍')

  // Patch native files
  spinner.start('Patching files...')
  // const releaseChannel = version + '-' + env
  // await patching.patch(exploPlist, {
  //   insert: releaseChannel,
  //   replace: 'release-channel-to-update',
  // })
  await patching.patch(exploPlist, {
    insert: sdkVersion,
    replace: 'sdk-version-to-update',
  })
  await patching.patch(infoPlist, {
    insert: version,
    replace: '$(MARKETING_VERSION)',
  })
  await patching.patch(infoPlist, {
    insert: buildNumber,
    replace: '$(CURRENT_PROJECT_VERSION)',
  })
  // await patching.patch(androidManifest, {
  //   insert: releaseChannel,
  //   replace: 'release-channel-to-update',
  // })
  await patching.patch(androidManifest, {
    insert: sdkVersion,
    replace: 'sdk-version-to-update',
  })
  await patching.patch(appBuildGradle, {
    insert: 'versionName "' + version + '"',
    replace: 'versionName "1.0"',
  })
  await patching.patch(appBuildGradle, {
    insert: 'versionCode ' + buildNumber,
    replace: 'versionCode 1',
  })

  // Remove Flipper & enable Hermes
  await patching.patch('ios/Podfile', {
    delete: /.*(use_flipper|flipper_post_install).*/gm,
  })
  await patching.patch(appBuildGradle, {
    replace: 'enableHermes: false,',
    insert: 'enableHermes: true,',
  })

  spinner.succeed('Native files patched, parfait 💥')

  await runPrettier(toolbox, [
    'app.config.js',
  ])
}
