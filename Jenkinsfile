#!groovy

import org.apache.log4j.*
import groovy.util.logging.*

def reponame="eis-abus-activation-code"
def zip_ext=".zip"
def branch = "${env.BRANCH_NAME}"
def zip_file_name ="${reponame}" + "${zip_ext}"
def checkout_directory = "${env.PWD}"
def zip_path = "/home/ec2-user/jenkins-agt/${reponame}"
def zip_dir ="${zip_path}/${zip_file_name}"
def repo_path_name ="/home/ec2-user/jenkins-agt/workspace/EIS_ABUS_Automation"
def git_branch_name="master"
def Testing_dir="/home/ec2-user/jenkins-agt/workspace/EIS_ABUS_Automation/build"
def build_xml_file="${Testing_dir}/build.xml"

if(branch == 'development')
{
def testing_env="DEV"

              node("EIS-ABUS-linux-001")
              {
                    git url: 'git@git.autodesk.com:eis/eis-abus-activation-code', credentialsId: '', branch: 'development'
                                     
                                                        
                                                         
                            stage ('Clean Up Zip Folder')
                            { 
                                echo "cleaning zip folder"
								
								sh "touch ${zip_path}/test.txt"
								
								sh "rm -r  ${zip_path}/*" 
                                                                           
                            }
                            stage ('Build')
                            {
                            echo "Building now"      
                            }
              
                            stage ('Create Zip Folder')  
                            {
                             sh "npm install"
                             sh "zip -r ${zip_dir} *"
                            }             
                     
                            stage ('Deploy to Lambda')
                            {
                            sh "aws lambda update-function-code --function-name ${reponame} --region us-east-1 --zip-file fileb://${zip_dir}"
                            }
							
							stage ('Automated Testing')
							{
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} checkout ${git_branch_name}"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "cd ${Testing_dir}"
							echo "Dev Testing Completed"
							}		
							 

				}

}

if(branch == 'stage')
{
def testing_env="STG"

              node("EIS-ABUS-linux-002")
              {
                    git url: 'git@git.autodesk.com:eis/eis-abus-activation-code', credentialsId: '', branch: 'stage'
                                     
                    echo "This is a branch we care about, let's kick off the pipeline"
                                           
                                                         
                            stage ('Clean Up Zip Folder')
                            { 
                                echo "cleaning zip folder"
								
								sh "touch ${zip_path}/test.txt"
								
								sh "rm -r  ${zip_path}/*" 
                                                                           
                            }
                            stage ('Build')
                            {
                            echo "Building now"      
                            }
              
                            stage ('Create Zip Folder')  
                            {
                             sh "npm install"
                             sh "zip -r ${zip_dir} *"
                            }             
                     
                            stage ('Deploy to Lambda')
                            {
							
                            sh "aws lambda update-function-code --function-name ${reponame} --region us-west-2 --zip-file fileb://${zip_dir}"
							
                            }
							stage ('Automated Testing')
							{
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} checkout ${git_branch_name}"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "cd ${Testing_dir}"
							echo "Stage Testing Completed"
							}							
                  
              }   
}			  
if(branch == 'master')
{
def testing_env="PRD"

              node("EIS-ABUS-linux-003")
              {
                    git url: 'git@git.autodesk.com:eis/eis-abus-activation-code', credentialsId: '', branch: 'master'
                                     
                    echo "This is a branch we care about, let's kick off the pipeline"
                                           
                            stage ('Clean Up Zip Folder')
                            { 
                                echo "cleaning zip folder"
								
								sh "touch ${zip_path}/test.txt"
								
								sh "rm -r  ${zip_path}/*" 
                                                                           
                            }
                            stage ('Build')
                            {
                            echo "Building now"      
                            }
              
                            stage ('Create Zip Folder')  
                            {
                             sh "npm install"
                             sh "zip -r ${zip_dir} *"
                            }             
                     
                            stage ('Deploy to Lambda')
                            {
							
                            sh "aws lambda update-function-code --function-name ${reponame} --region us-east-1 --zip-file fileb://${zip_dir}"
							
                            }
							stage ('Automated Testing')
							{
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} checkout ${git_branch_name}"
							sh "git --git-dir=${repo_path_name}/.git --work-tree=${repo_path_name} pull"
							sh "cd ${Testing_dir}"
							echo "Prod Testing Completed"
							}							
                  
                }
}		
